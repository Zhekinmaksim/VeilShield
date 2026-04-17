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
- permit-based local decrypt
- auditor-scoped selective disclosure path

## What matters for the next wave

### 1. Demo reliability

- keep seeded live state non-empty
- keep claims-first default impression useful even when finalize is delayed
- reduce `PendingDecision` friction in judge flows
- tighten the oracle claim path for recording

### 2. Product clarity

- keep exporter wedge consistent across UI, docs, and submission
- explain why exporters need privacy in concrete terms
- keep privacy boundary explicit and narrow

### 3. Operational visibility

- stronger claim history
- clearer pending / ready / settled status copy
- cleaner role-specific dashboards

## What we are not doing right now

- broad multi-product insurance platform
- complex pricing engine
- generic “privacy infra” positioning
- adding features just to increase the FHE operation count

The next wave should make VeilShield easier to judge, not just larger.
