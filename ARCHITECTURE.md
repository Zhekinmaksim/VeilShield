# VeilShield Architecture

## One-line product

VeilShield is confidential cargo delay cover for exporters: delay thresholds, claim logic, and role-scoped policy views stay private on-chain.

The trigger path stays encrypted on-chain, while premiums and payouts still settle in a visible ERC-20 test asset.

## Live stack

- Network: `Arbitrum Sepolia`
- App: [https://veilshield.xyz](https://veilshield.xyz)
- Main contract: [0x42Fd32Fa18975D5A2Ba57bb0e86682aE9dEb13Da](https://sepolia.arbiscan.io/address/0x42Fd32Fa18975D5A2Ba57bb0e86682aE9dEb13Da#code)
- Demo token: [0x8D58098D3B2Cbef4c5fa1CFef38A0baD7Ef81C70](https://sepolia.arbiscan.io/address/0x8D58098D3B2Cbef4c5fa1CFef38A0baD7Ef81C70#code)

## System layout

### Contract layer

`VeilShield.sol` handles:

- policy creation
- pool deposits and withdrawals
- encrypted oracle updates
- encrypted trigger evaluation
- async finalize flow
- token payout settlement
- owner-scoped auditor disclosure

`VeilShieldDemoToken.sol` is the live demo asset used for:

- LP deposits
- premium payments
- beneficiary payouts

### Frontend layer

`veilshield-app.jsx` is wired to the live deployment and exposes four workspaces:

- `Policy Holder`
- `Liquidity Provider`
- `Oracle / Claims`
- `Auditor`

The frontend handles:

- wallet connection
- network checks
- CoFHE initialization
- permit issuance
- local decrypt for role-scoped views
- polling for async claim readiness

### Privacy flow

1. The user encrypts a threshold in the browser.
2. The oracle encrypts the live reading before submission.
3. The contract compares encrypted values with `FHE.gte` or `FHE.lte`.
4. The contract computes payout routing with `FHE.select`.
5. The trigger decision becomes available through async `FHE.decrypt`.
6. Role-scoped users decrypt only their own permitted view locally.

## FHE operations in the contract

- `FHE.asEuint64`
- `FHE.asEbool`
- `FHE.add`
- `FHE.sub`
- `FHE.gte`
- `FHE.lte`
- `FHE.select`
- `FHE.allowThis`
- `FHE.allow`
- `FHE.decrypt`

## Why this architecture fits the use case

Exporters do not need every field hidden equally. What matters most is keeping the risk logic private:

- delay thresholds reveal operating tolerance
- oracle-trigger comparison reveals claim posture
- pending payout reveals claim direction before settlement

That is the part VeilShield keeps inside encrypted computation.
