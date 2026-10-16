#!/usr/bin/env node
/**
 * Validates this Claude plugin marketplace without dependencies (Node >= 18):
 *  - .claude-plugin/marketplace.json and every plugin's .claude-plugin/plugin.json
 *  - every skills/<name>/SKILL.md against the Agent Skills spec (https://agentskills.io/specification):
 *    name 1-64 chars [a-z0-9-], no leading/trailing/double hyphen, equal to the folder name;
 *    description 1-1024 chars; compatibility <= 500 chars; metadata a string map; body < 500 lines
 *  - relative markdown links and `references/...` / `scripts/...` / `assets/...` mentions resolve
 *  - .mcp.json servers use https and carry no credentials
 *  - no secrets anywhere (X3 secret keys, bearer tokens, private keys)
 *
 *   node scripts/validate.mjs [root]      exit code 1 on problems
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RESERVED_MARKETPLACES = new Set([
  "claude-code-marketplace", "claude-code-plugins", "claude-plugins-official", "anthropic-marketplace", "anthropic-plugins",
  "agent-skills", "anthropic-agent-skills", "knowledge-work-plugins", "inline", "builtin", "skills-dir", "synced", "npm", "github",
]);
const RESERVED_PLUGIN_PREFIXES = ["claude-", "anthropic-", "cc-plugin-"];
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECRET_PATTERNS = [
  /sk_3x_[0-9A-Za-z]{20,}/,
  /pxk_[0-9A-Za-z]{20,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(?:ghp|gho|ghs|github_pat)_[0-9A-Za-z_]{20,}/,
  /\bnpm_[0-9A-Za-z]{30,}/,
  /Bearer\s+[0-9A-Za-z._-]{30,}/,
];

/** Minimal YAML frontmatter parser: `key: value`, quoted scalars and one level of nested maps */
export function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text.replace(/\r\n/g, "\n"));
  if (!match) return { data: null, body: text };
  const data = {};
  let parent = null;
  for (const raw of match[1].split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const nested = /^ {2,}([A-Za-z0-9_-]+):\s*(.*)$/.exec(raw);
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(raw);
    const scalar = (value) => value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (nested && parent) data[parent][nested[1]] = scalar(nested[2]);
    else if (top) {
      if (top[2] === "") {
        data[top[1]] = {};
        parent = top[1];
      } else {
        data[top[1]] = scalar(top[2]);
        parent = null;
      }
    } else throw new Error(`unsupported frontmatter line: ${raw}`);
  }
  return { data, body: text.slice(match[0].length) };
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    if (entry === ".git" || entry === "node_modules") return [];
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function readJson(path, problems) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    problems.push(`${path}: invalid JSON (${error.message})`);
    return null;
  }
}

/** Problems of one skill folder */
export function validateSkill(dir) {
  const problems = [];
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) return [`${dir}: SKILL.md missing`];
  const text = readFileSync(file, "utf8");
  let parsed;
  try {
    parsed = parseFrontmatter(text);
  } catch (error) {
    return [`${file}: ${error.message}`];
  }
  const { data, body } = parsed;
  if (!data) return [`${file}: frontmatter missing`];
  const folder = dir.split(/[\\/]/).filter(Boolean).pop();
  const name = data.name;
  if (typeof name !== "string" || name.length < 1 || name.length > 64 || !SKILL_NAME.test(name)) problems.push(`${file}: name must be 1-64 chars of a-z, 0-9 and single hyphens`);
  if (name !== folder) problems.push(`${file}: name "${name}" must equal the folder name "${folder}"`);
  if (typeof data.description !== "string" || data.description.length < 1 || data.description.length > 1024) problems.push(`${file}: description must be 1-1024 characters (has ${String(data.description ?? "").length})`);
  if (data.compatibility !== undefined && (typeof data.compatibility !== "string" || data.compatibility.length > 500)) problems.push(`${file}: compatibility must be at most 500 characters`);
  if (data.metadata !== undefined && (typeof data.metadata !== "object" || Object.values(data.metadata).some((value) => typeof value !== "string"))) problems.push(`${file}: metadata must be a map of strings`);
  const allowed = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
  for (const key of Object.keys(data)) if (!allowed.has(key)) problems.push(`${file}: unknown frontmatter field "${key}"`);
  if (body.split("\n").length >= 500) problems.push(`${file}: body should stay below 500 lines`);
  for (const md of walk(dir).filter((path) => path.endsWith(".md"))) {
    const content = readFileSync(md, "utf8");
    for (const link of content.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)) {
      const target = resolve(dirname(md), link[1].split("#")[0]);
      if (!existsSync(target)) problems.push(`${md}: link ${link[1]} does not resolve`);
    }
    for (const mention of content.matchAll(/`((?:references|scripts|assets)\/[A-Za-z0-9._/-]+)`/g)) {
      if (!existsSync(join(dir, mention[1]))) problems.push(`${md}: ${mention[1]} does not exist in the skill`);
    }
  }
  return problems;
}

/** Problems of the whole marketplace at `root` */
export function validateMarketplace(root) {
  const problems = [];
  const marketplacePath = join(root, ".claude-plugin/marketplace.json");
  const marketplace = existsSync(marketplacePath) ? readJson(marketplacePath, problems) : (problems.push(`${marketplacePath} missing`), null);
  if (marketplace) {
    if (!/^[A-Za-z0-9._-]+$/.test(marketplace.name ?? "") || RESERVED_MARKETPLACES.has(marketplace.name) || /^claudeai-/.test(marketplace.name)) problems.push(`marketplace name "${marketplace.name}" is invalid or reserved`);
    if (!marketplace.owner?.name) problems.push("marketplace owner.name missing");
    if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) problems.push("marketplace has no plugins");
    for (const entry of marketplace.plugins ?? []) {
      if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
        problems.push(`plugin ${entry.name}: only relative sources are used in this repo`);
        continue;
      }
      const pluginDir = join(root, entry.source);
      const manifestPath = join(pluginDir, ".claude-plugin/plugin.json");
      if (!existsSync(manifestPath)) {
        problems.push(`plugin ${entry.name}: ${relative(root, manifestPath)} missing`);
        continue;
      }
      const manifest = readJson(manifestPath, problems);
      if (!manifest) continue;
      if (manifest.name !== entry.name) problems.push(`plugin ${entry.name}: plugin.json name "${manifest.name}" differs`);
      if (!SKILL_NAME.test(manifest.name ?? "") || RESERVED_PLUGIN_PREFIXES.some((prefix) => manifest.name.startsWith(prefix))) problems.push(`plugin ${manifest.name}: invalid or reserved name`);
      if (entry.version && manifest.version && entry.version !== manifest.version) problems.push(`plugin ${entry.name}: version ${entry.version} in marketplace.json differs from plugin.json ${manifest.version}`);
      if (existsSync(join(pluginDir, "bin"))) problems.push(`plugin ${entry.name}: a top-level bin/ folder blocks install on claude.ai`);
      const mcpPath = join(pluginDir, ".mcp.json");
      if (existsSync(mcpPath)) {
        const mcp = readJson(mcpPath, problems);
        for (const [server, config] of Object.entries(mcp?.mcpServers ?? {})) {
          if (config.type !== "http" || !String(config.url ?? "").startsWith("https://")) problems.push(`plugin ${entry.name}: MCP server ${server} must be type http with an https url`);
          if (config.headers || config.env) problems.push(`plugin ${entry.name}: MCP server ${server} must not carry headers/env (credentials)`);
        }
      }
      const skillsDir = join(pluginDir, "skills");
      if (existsSync(skillsDir)) for (const skill of readdirSync(skillsDir)) problems.push(...validateSkill(join(skillsDir, skill)));
    }
  }
  for (const file of walk(root)) {
    if (/\.(?:png|jpe?g|gif|zip|ico)$/.test(file)) continue;
    const content = readFileSync(file, "utf8");
    for (const pattern of SECRET_PATTERNS) if (pattern.test(content)) problems.push(`${relative(root, file)}: looks like it contains a secret (${pattern.source.slice(0, 20)}…)`);
  }
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
  const problems = validateMarketplace(root);
  for (const problem of problems) console.error(`✗ ${problem}`);
  if (problems.length) process.exit(1);
  console.log(`✓ ${root}: marketplace, plugins and skills are valid`);
}
