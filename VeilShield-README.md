# VeilShield Notes

This file is the longer project note behind the demo.

## Working rule

AI tools are useful for moving faster, but they should not be used to pad the project with shallow complexity.

For this repo, that means:

- if a feature is in the UI, there should be a contract path behind it
- if a privacy claim is made, the boundary should be written down in plain terms
- if a workflow is presented as live, it should be deployable and testable
- if something is still rough, it should be called rough instead of dressed up

## The idea

Most on-chain insurance products expose too much. For exporters, a public delay threshold can reveal logistics tolerance, and a public coverage amount can leak shipment size or treasury posture.

VeilShield uses Fhenix CoFHE so the trigger path and user-scoped encrypted views stay inside encrypted contract state while the protocol still settles a visible ERC-20 demo asset on testnet.

## How the flow works

1. An exporter creates a cargo delay policy with public token amounts plus an encrypted threshold.
2. The oracle submits an encrypted reading for a shipping-related feed.
3. The contract compares the encrypted reading against the encrypted threshold.
4. The contract computes an encrypted payout with `FHE.select`.
5. The trigger result is finalized asynchronously through decryption.
6. If the policy triggered, the beneficiary receives `vUSD`.
7. Role-specific users can unseal only their own permitted view in the browser.

The contract does not need to branch on plaintext trigger values while doing the main evaluation.

## Contract layout

### `VeilShield.sol`

Main responsibilities:

- store policy terms
- store LP balances
- track oracle feeds
- evaluate triggers
- settle payouts
- expose owner-scoped auditor disclosure handles

Key pieces of public state:

- beneficiary
- feed id
- expiry
- token liquidity
- token reserved

Key encrypted state:

- coverage mirror
- premium mirror
- threshold
- oracle reading
- LP balances
- pending payout

### `VeilShieldDemoToken.sol`

This is a zero-decimal token used to make the testnet flow visible:

- LPs deposit it
- policy holders pay premium in it
- beneficiaries receive payout in it
- anyone can mint from the faucet

## FHE operations used

The contract uses the operations that actually matter for the demo:

| Operation | Why it is there |
| --- | --- |
| `FHE.asEuint64` | turn a threshold input or public token amount into a contract handle |
| `FHE.asEbool` | turn a public boolean into an encrypted branch condition |
| `FHE.add` | pool totals, deposits, premiums |
| `FHE.sub` | withdrawals, reserve release, settlement |
| `FHE.gte` | upper-bound trigger checks |
| `FHE.lte` | lower-bound trigger checks |
| `FHE.select` | choose payout or zero without exposing the branch |
| `FHE.allowThis` | let the contract keep using stored handles |
| `FHE.allow` | let the right user decrypt their own view |
| `FHE.decrypt` | request async decryption for finalize / settlement flow |

## Privacy boundary

This project is not fully opaque in every dimension.

Coverage amount, premium amount, expiry, beneficiary, and pool liquidity are still public because ERC-20 transfers and reserve accounting need concrete values. The contract mirrors the token terms into encrypted handles and keeps the trigger path, LP balances, oracle reading, and payout selection inside encrypted logic. That is a conscious tradeoff rather than a hidden limitation.

## Why FHE here

ZK, MPC, and TEEs all have their place, but this project needs one specific property: compare two hidden values and derive the payout from the result without revealing the inputs during evaluation.

That is exactly the part CoFHE is being used for.

## Current scope

What is already in place:

- live Arbitrum Sepolia deployment
- verified source on Arbiscan
- end-to-end demo flow with `vUSD`
- local tests for deposit, policy creation, evaluation, and settlement
- frontend wired to the live contracts
- privacy boundary written down instead of implied
- role-based frontend workspaces
- permit-based selective disclosure UX
- seeded demo path for a non-empty judge-facing state

What is still rough:

- oracle input is still manual
- payout accounting is still closer to a demo than production underwriting
- redeploy is required any time contract-side disclosure rules change

## Roadmap

### Wave 1

- token-backed demo flow
- encrypted policy lifecycle
- live frontend

### Wave 2

- cleaner wallet and permit handling
- better oracle tooling
- more realistic feed adapters

### Wave 3

- policy pricing logic
- richer pool accounting
- multiple trigger compositions

### Wave 4

- selective disclosure for auditors
- operational dashboards
- stronger access tooling around decrypt rights

### Wave 5

- embedded landing page inside the live app
- more complete product surface
- governance, reporting, and capital management staged as next product work
