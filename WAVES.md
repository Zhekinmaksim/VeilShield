# VeilShield Waves

## Current product wedge

Confidential cargo delay cover for exporters: delay thresholds, claim logic, and role-scoped policy views stay private on-chain.

## What is already shipped

- live app on [veilshield.xyz](https://veilshield.xyz)
- live contracts on `Arbitrum Sepolia`
- verified source on Arbiscan
- embedded landing page inside the live React app
- token-backed deposit, premium, and payout flow
- encrypted threshold evaluation with CoFHE
- role-based workspaces
- private-view local decrypt
- auditor-scoped selective disclosure path

## What matters for Wave 5

Wave 5 keeps VeilShield on the same exporter cargo-delay wedge. The goal is to make that flow more complete and easier to evaluate, not to add a new insurance vertical.

### 1. Demo reliability

- keep seeded live state non-empty
- make the seeded demo scenario cleaner and easier to replay
- keep claims-first default impression useful even when finalize is delayed
- reduce `PendingDecision` friction in judge flows
- tighten the oracle claim path for recording
- polish the final demo recording path
- keep background refresh problems and noisy toasts out of the demo path
- disable dead-end actions when the threshold network is still busy

### 2. Product clarity

- keep exporter wedge consistent across UI, docs, and submission
- explain why exporters need privacy in concrete terms
- make the first-time judge path clear before wallet connection
- keep privacy boundary explicit and narrow
- keep the landing and app as one product surface, not separate waves

### 3. Operational visibility

- stronger claim history
- clearer `waiting on threshold` / `ready to finalize` / `settled` status copy
- cleaner role-specific dashboards
- improved auditor review screens

### 4. Usage signal

- collect a few real tester notes from the current live demo
- collect small signals from site visits, wallet connects, and tester feedback
- keep claims factual and tied to observed demo behavior

## Wave 3 working focus

- stabilize the claims workspace first, because it is the default first impression
- make pending threshold results read like part of the product instead of a broken state
- keep selective disclosure explicit and easy to demo
- collect small but real usage signals instead of inflating traction claims
- keep the seeded exporter scenario fixed so the site, docs, and demo video do not drift

## Wave 4 working focus

- make the exporter flow easier to evaluate without changing the contract
- add two policy templates instead of expanding into many insurance categories
- make the claims pipeline visible as a staged operational flow
- improve LP exposure context around reserved capital, open covers, and pending claims
- make auditor disclosure more explicit: public fields, encrypted mirrors, and bounded owner review
- keep usage and tester notes factual, small, and tied to actual demo behavior

## Wave 5 working focus

- embed the landing page into the live React application as the first-time judge path
- make the first screen explain the product thesis, demo link, contract links, role explanations, privacy boundary, FHE flow, and live deployment proof
- keep Wave 5 as the only current wave by folding final presentation and evaluation readiness into the product surface
- maintain one-click access from the landing to the claims, policy, LP, and auditor workspaces
- refine the policy holder flow around private threshold selection and local decrypt access
- improve claim history and auditor review screens
- keep the roadmap factual: tester notes, usage signals, reporting, and capital-management improvements are next steps until they are supported by the live demo

## What we are not doing right now

- broad multi-product insurance platform
- complex pricing engine
- generic “privacy infra” positioning
- adding features just to increase the FHE operation count

Wave 5 should make VeilShield easier to judge, not just larger.
