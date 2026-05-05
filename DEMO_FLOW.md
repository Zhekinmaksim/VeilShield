# VeilShield Demo Flow

## Best short explanation

VeilShield lets an exporter buy cargo delay cover where the threshold, trigger evaluation, and role-scoped policy views stay encrypted on-chain.

## Fastest judge flow

### If the seeded state is already live

Show this order:

1. `Oracle / Claims` workspace
2. status rail: wallet, network, CoFHE, access, contract
3. existing active queue rows
4. public claim trail
5. switch to `Policy Holder`
6. `Request Access` from the `Private View Access` panel
7. `Decrypt My View`
8. switch to `Auditor`
9. `Decrypt Auditor View`

That path shows privacy architecture faster than recording the whole lifecycle from zero.

### If you need the full live flow

1. Connect wallet on `Arbitrum Sepolia`
2. Go to `Liquidity Provider`
3. Mint `vUSD`
4. Approve `vUSD`
5. Deposit liquidity
6. Go to `Policy Holder`
7. Create a cargo delay policy
8. Preview the encrypted threshold
9. Submit the policy
10. Go to `Oracle / Claims`
11. Submit an encrypted oracle reading
12. Request evaluation
13. Wait for threshold network readiness
14. Finalize when the row moves from `waiting on threshold` to `ready to finalize`
15. Settle if triggered
16. Return to role-scoped decrypt views

## Demo values that read well on screen

- LP deposit: `50000`
- Feed: `Shipment Delay (hours)`
- Direction: `>= delay above threshold`
- Threshold: `48`
- Coverage: `1800`
- Premium: `120`
- Oracle reading for trigger: `72`

## What to point at during the demo

- encrypted ciphertext handles instead of fake numbers
- live testnet addresses
- role-separated workspaces
- private view access status
- async claim status
- public claim history versus private policy terms

## One sentence per role

- `Policy Holder`: buy cover and decrypt your own terms only
- `LP`: fund the pool and decrypt your own LP balance only
- `Oracle / Claims`: submit sealed feed updates and progress claims
- `Auditor`: inspect bounded disclosure without opening the whole protocol state

## Current caveat

The seeded live state can stall in `PendingDecision` when the testnet threshold network is slow. The app now opens on the claims workspace so the first screen is still populated with live queue rows and public history, and pending rows are labeled as `waiting on threshold` instead of looking like a silent failure.
