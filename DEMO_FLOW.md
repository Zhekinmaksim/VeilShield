# VeilShield Demo Flow

## Best short explanation

VeilShield lets an exporter buy cargo delay cover where the threshold, trigger evaluation, and role-scoped policy views stay encrypted on-chain.

## Fastest judge flow

Start on `Overview`, then click `Open Live App`.

### If the seeded state is already live

Show this order:

1. `Oracle / Claims` workspace
2. `Replayable Demo Seed` card
3. status rail: wallet, network, CoFHE, access, contract
4. existing active queue rows
5. public claim trail
6. switch to `Policy Holder`
7. `Request Access` from the `Private View Access` panel
8. `Decrypt My View`
9. switch to `Auditor`
10. `Decrypt Auditor View`

That path shows privacy architecture faster than recording the whole lifecycle from zero.

## Replaying the seeded scenario

The seed is idempotent against the canonical exporter scenario, not just any active or settled row. Re-running it should resume pending decisions where possible, create only missing canonical rows, and leave unrelated live policies alone.

```bash
npm run seed:arb-sepolia
```

Canonical ready state:

- active shipment-delay cover: threshold `48h`, coverage `1800`, premium `120`
- settled shipment-delay history row: threshold `60h`, oracle reading `72h`, coverage `2200`, premium `180`
- pool liquidity target: `50000 vUSD`

## Final recording path

Use this order for the final Wave 5 recording:

1. Start on `Overview`.
2. Point at the headline: confidential cargo delay cover for exporters.
3. Point at `Privacy boundary`: threshold, oracle reading, payout selection, LP balance, and auditor disclosure.
4. Point at `Live deployment`: VeilShield contract, vUSD token, oracle wallet.
5. Click `Open Live App`.
6. In `Oracle / Claims`, point at `Replayable Demo Seed`.
7. Point at `Claims Book`: active / pending / ready-to-finalize rows.
8. Point at `Public Claim Trail`: public lifecycle history without private thresholds.
9. Switch to `Policy Holder`.
10. Pick `Shipment delay`, point at `Private Delay Threshold`, then `Preview Threshold`.
11. Point out that private view access is not needed to create cover; it is needed later for local decrypt.
12. Switch to `Auditor`.
13. Point at `Selective Disclosure Queue`: public facts, encrypted mirrors, and bounded review state.
14. If owner wallet is connected and permit is ready, decrypt one auditor row.

Avoid during the recording:

- creating a new vertical or policy category
- claiming private settlement for fields that are still public
- waiting silently on threshold readiness without explaining `waiting on threshold`
- presenting local counters as adoption or traction

### If you need the full live flow

1. Connect wallet on `Arbitrum Sepolia`
2. Go to `Liquidity Provider`
3. Mint `vUSD`
4. Approve `vUSD`
5. Deposit liquidity
6. Go to `Policy Holder`
7. Choose the `Shipment delay` or `Delivery SLA delay` template
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

## Wave 5 template values

- `Shipment delay`: threshold `48`, coverage `1800`, premium `120`
- `Delivery SLA delay`: threshold `72`, coverage `2400`, premium `180`

## What to point at during the demo

- encrypted ciphertext handles instead of fake numbers
- live testnet addresses
- role-separated workspaces
- private view access status
- async claim status
- claims pipeline stages
- LP exposure summary
- auditor disclosure summary
- public claim history versus private policy terms

## One sentence per role

- `Policy Holder`: buy cover and decrypt your own terms only
- `LP`: fund the pool and decrypt your own LP balance only
- `Oracle / Claims`: submit sealed feed updates and progress claims
- `Auditor`: inspect bounded disclosure without opening the whole protocol state

## Current caveat

The seeded live state can stall in `PendingDecision` when the testnet threshold network is slow. The app now opens on the claims workspace so the first screen is still populated with live queue rows and public history, and pending rows are labeled as `waiting on threshold` instead of looking like a silent failure.
