# VeilShield Privacy Model

## Goal

Keep cargo delay claim logic private without pretending the whole protocol is opaque.

## What stays encrypted

| Field | Why it is encrypted | Who can decrypt it |
| --- | --- | --- |
| Policy threshold | Reveals exporter delay tolerance | Insured, owner via private-view access |
| Oracle reading | Reveals live signal used for claim logic | Oracle during submission, contract during evaluation |
| Pending payout | Reveals likely claim outcome before settlement | Insured, beneficiary, owner |
| LP balance handle | Keeps provider position private from public readers | Connected LP |
| Coverage mirror | Used inside encrypted policy view | Insured, owner |
| Premium mirror | Used inside encrypted policy view | Insured, owner |

## What stays public

| Field | Why it is public |
| --- | --- |
| Coverage amount | ERC-20 reserve accounting needs a concrete number |
| Premium amount | ERC-20 payment flow is public in the demo token |
| Beneficiary | Token payout target must be public |
| Expiry | Claim lifecycle needs a public cutoff |
| Feed id | Oracle routing needs a public selector |
| Pool token liquidity and reserved totals | Token solvency is visible on-chain |

## Disclosure model

VeilShield uses selective disclosure, not blanket transparency.

- `Policy Holder`: can decrypt policy terms and their own pending payout view
- `Beneficiary`: can decrypt pending payout
- `Liquidity Provider`: can decrypt only their own LP balance view
- `Auditor`: owner-scoped path can decrypt policy mirrors and pending payout
- Public chain reader: sees ciphertext handles, events, and public token state only

## Wave 4 disclosure summaries

The frontend now shows the same boundary in the role workspaces:

- `LP`: public pool totals and reserved capital stay visible, while the connected LP balance is a private view
- `Auditor`: public policy fields are shown separately from encrypted mirrors and pending payout review data
- `Claims`: threshold, oracle reading, and pending payout are labeled as encrypted while premium, coverage, beneficiary, and expiry remain public

## Short reference table

| Question | Current answer |
| --- | --- |
| What is encrypted? | threshold, oracle reading, payout mirror, LP balance handle, policy mirrors |
| What is public? | token terms, beneficiary, expiry, feed id, pool totals |
| Who can decrypt what? | policy holder, beneficiary, LP, and owner each get a narrower role-scoped view |

## Why this is useful for exporters

On a transparent insurance protocol, these signals leak too much:

- threshold values expose what delay exporters can tolerate
- coverage size exposes shipment exposure or treasury posture
- claim timing exposes operational weak points

VeilShield keeps those parts scoped while still settling on-chain.

## Honest limits

This is still a testnet demo.

- token transfers are public
- beneficiary is public
- pool accounting is public
- oracle input is still manual
- async decrypt readiness depends on the live threshold network

Those are real limits, not hidden footnotes.
