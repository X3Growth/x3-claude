# Verification checklist

The current procedure is the `connection_test` instructions (`setup_get_prompt` kind
`connection_test`, or the MCP prompt `connection_test`) and the guide `sdk/troubleshooting`. Read them
first; this list is the minimum that must hold before you report success.

1. **Build is green.** The project's own typecheck, lint, tests and production build pass.
2. **No leaked secrets.** `git diff` contains no `.env*` file and no `sk_3x_` key; the browser output
   (`.next/static`, `dist`, `build`, `out`, …) contains no secret key. The publishable key `pk_3x_…`
   is public and allowed.
3. **Snippet live.** `setup_verify_installation` with the public (production or preview) URL passes
   every check it reports. A failed origin check means the domain must be allowed in the project –
   only allow domains the user confirmed they own.
4. **First pageview.** Ask the user to open the site with the test parameter the instructions name.
   Poll `events_tail` with `include_test: true` (test visits are hidden otherwise) until the pageview
   arrives – at most about two minutes. Nothing arrives → `setup_status` reason codes, then the
   browser network tab (the ingest request should answer 2xx; 403 = origin not allowed or proxy key
   wrong), then `sdk/troubleshooting`.
5. **Navigation.** In single-page apps, two in-app page changes give exactly one pageview each
   (none missing, none doubled).
6. **Events.** Trigger each instrumented interaction once (form submit, booking, WhatsApp/phone/mail
   click, quiz answer, CTA, video play) and confirm it in `events_tail` with the expected name/props.
7. **Consent.** With a banner: grant consent in the test visit and confirm the consent counters in
   `setup_status` move; with "deny" nothing beyond the documented cookieless data is stored.
8. **Proxy.** With a first-party proxy, `setup_status` shows traffic arriving via the proxy.
9. **Server-side.** For backend lead/conversion calls, submit one test inquiry and confirm the lead
   (or server event) appears and is linked to the test session. Use test modes only.
10. **Final status.** Run `setup_status` once more and report every open item with the fix it names.

Without the MCP server, verify with the browser network tab and the X3 dashboard's live view instead,
and say which checks could not be run.
