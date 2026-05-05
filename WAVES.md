# VeilShield Waves

## Current product wedge

Confidential cargo delay cover for exporters: delay thresholds, claim logic, and role-scoped policy views stay private on-chain.

## What is already shipped

- live app on [veilshield.xyz](https://veilshield.xyz)
- live contracts on `Arbitrum Sepolia`
- verified source on Arbiscan
- token-backed deposit, premium, and payout flow
- encrypted threshold evaluation with CoFHE
- role-based workspaces
- private-view local decrypt
- auditor-scoped selective disclosure path

## What matters for the next wave

### 1. Demo reliability

- keep seeded live state non-empty
- keep claims-first default impression useful even when finalize is delayed
- reduce `PendingDecision` friction in judge flows
- tighten the oracle claim path for recording
- keep background refresh problems and noisy toasts out of the demo path
- disable dead-end actions when the threshold network is still busy

### 2. Product clarity

- keep exporter wedge consistent across UI, docs, and submission
- explain why exporters need privacy in concrete terms
- keep privacy boundary explicit and narrow

### 3. Operational visibility

- stronger claim history
- clearer `waiting on threshold` / `ready to finalize` / `settled` status copy
- cleaner role-specific dashboards

## Wave 3 working focus

- stabilize the claims workspace first, because it is the default first impression
- make pending threshold results read like part of the product instead of a broken state
- keep selective disclosure explicit and easy to demo
- collect small but real usage signals instead of inflating traction claims
- keep the seeded exporter scenario fixed so the site, docs, and demo video do not drift

## What we are not doing right now

- broad multi-product insurance platform
- complex pricing engine
- generic “privacy infra” positioning
- adding features just to increase the FHE operation count

The next wave should make VeilShield easier to judge, not just larger.
