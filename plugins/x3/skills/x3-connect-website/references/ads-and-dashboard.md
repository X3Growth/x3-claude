# Dashboard operations and ad accounts (explicit request only)

Use this file **only** when the user explicitly asks you to operate the X3 dashboard for them or to
connect an ad account. Never start it on your own, and confirm the exact action before each step.

## Ground rules

- Ad platforms are **read-only** for X3 and for you: no creating, editing, pausing or deleting
  campaigns, ad sets, ads, budgets, bids, audiences, pixels or conversion actions. The only writes X3
  makes to an ad platform are conversion uploads the user configured.
- The user signs in to Meta/Google/LinkedIn/TikTok **themselves**. Never ask for or type platform
  passwords, 2FA codes or tokens.
- Prefer X3's own tools and connect flows over clicking through UIs. Read the current guide first:
  `ads` (overview), `ads/google`, `ads/meta`, `ads/linkedin`, `ads/tiktok`, `insights/client-connect-link`,
  `conversions/*`.

## Connect an ad account

1. Read `ads` and the platform guide. Check what exists: `ads_accounts_list`, `setup_status`.
2. Explain the flow and get an explicit "yes, connect <platform> for project <x>".
3. Start the connection through the documented route – in the dashboard (Project → Ads → connect) or
   the REST endpoint the guide names, which returns a hosted OAuth URL. Give the URL to the user; they
   complete the login and account selection in their browser.
4. If the account belongs to the user's client, the guide `insights/client-connect-link` describes a
   link the client opens themselves – suggest it instead of shared logins.
5. After the user confirms the login: verify with `ads_accounts_list` / `ads_sync_status`; the first
   backfill can take a while. Then show the UTM templates (`ads_utm_templates`) the user should put on
   their ads – the user changes their ads, not you.

## Conversion destinations (Meta CAPI, Google Ads, LinkedIn, TikTok)

1. Read `conversions` and the platform guide; list existing definitions (`conversions_definitions_list`).
2. Credentials (pixel/dataset ids, access tokens, customer ids) are entered by the user in the X3
   dashboard, never pasted into chat or code.
3. Test only with `conversions_send_test` in test mode; review `conversions_match_quality`.
   Never call `conversions_mark` on real leads just to test.

## Operating the dashboard in a browser

Only if you have a browser tool **and** the user asked for it. Stay on the X3 dashboard domain,
do not change billing, members, roles or API keys unless that exact change was requested, and stop
and ask whenever a page asks for a password, payment or a confirmation you were not asked to give.
