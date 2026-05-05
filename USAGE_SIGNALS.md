# Wave 3 Usage Signals

Use this file to record real, small-scope signals without inflating traction claims.

## What to track

- live domain visits
- demo video views
- wallet connects
- policy previews
- policy creations
- oracle submissions
- decrypt actions

## Current instrumentation

The frontend now records best-effort local counters for:

- `live_domain_view`
- `demo_view`
- `wallet_connect`
- `mint_token`
- `approve_token`
- `deposit_liquidity`
- `preview_threshold`
- `create_policy`
- `oracle_submit`
- `permit_request`
- `decrypt_lp_view`
- `decrypt_policy_view`
- `decrypt_auditor_view`

If Vercel Analytics is later added, the same event names can be reused instead of inventing a second taxonomy.

## Submission-ready format

When real numbers are available, keep them narrow and factual:

- `X` live app visits over the Wave 3 period
- `Y` wallet connects
- `Z` demo video views
- `N` external testers completed the flow

Do not estimate adoption beyond what can be checked.
