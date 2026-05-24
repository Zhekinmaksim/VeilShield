# Buildathon Usage Signals

Use this file to record real, small-scope signals without inflating traction claims.

## What to track

- live domain visits
- demo video views
- Overview to app clicks
- contract link clicks from the Overview page
- wallet connects
- policy previews
- policy template selections
- policy creations
- oracle submissions
- decrypt actions
- tester feedback notes

## Current instrumentation

The frontend now records best-effort local counters for:

- `live_domain_view`
- `demo_view`
- `overview_open_live_app`
- `overview_create_policy`
- `overview_contract_click`
- `wallet_connect`
- `mint_token`
- `approve_token`
- `deposit_liquidity`
- `policy_template_select`
- `preview_threshold`
- `create_policy`
- `oracle_submit`
- `permit_request`
- `decrypt_lp_view`
- `decrypt_policy_view`
- `decrypt_auditor_view`

If Vercel Analytics is later added, the same event names can be reused instead of inventing a second taxonomy.

Local counters are stored in browser `localStorage` under:

```text
veilshield.wave5.metrics
```

For a quick local snapshot during testing, run this in the browser console:

```js
JSON.parse(localStorage.getItem("veilshield.wave5.metrics") || "{}")
```

## Submission-ready format

When real numbers are available, keep them narrow and factual:

- `X` live app visits over the Wave 5 period
- `A` Overview → app clicks
- `B` contract link clicks from the Overview page
- `Y` wallet connects
- `Z` demo video views
- `N` external testers completed the flow
- `M` template selections if local counters are available

Do not estimate adoption beyond what can be checked.

## Wave 5 feedback target

For Wave 5, collect enough signal to support narrow claims:

- first-time judges can understand the exporter cargo-delay wedge from the Overview page
- the replayable seed makes the live demo path easier to follow
- claim history reads like a lifecycle trail rather than a raw table
- auditor disclosure feels bounded instead of fully transparent
- policy holders understand when the threshold is encrypted and when local decrypt access is needed
