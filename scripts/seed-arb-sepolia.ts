import "dotenv/config";
import hre, { ethers } from "hardhat";
import { cofhejs, Encryptable } from "cofhejs/node";

import deployment from "../deployments/arb-sepolia.json";

const SCENARIO = {
  liquidityDeposit: 50000n,
  activePolicy: {
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 48n,
    coverage: 1800n,
    premium: 120n,
  },
  settledPolicy: {
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 60n,
    coverage: 2200n,
    premium: 180n,
    oracleReading: 72n,
  },
};

function makeFeedBytes32(value: string) {
  return ethers.encodeBytes32String(value);
}

async function encryptUint64(value: bigint) {
  const encrypted = await cofhejs.encrypt([Encryptable.uint64(value.toString())]);
  if (!encrypted.success) {
    throw new Error(`Encryption failed: ${encrypted.error}`);
  }

  return encrypted.data[0];
}

async function createCancelledHistoryPolicy(contract: any, signerAddress: string, expiry: bigint) {
  console.log("Creating cancelled fallback policy for non-empty public history...");
  const policyId = await contract.policyCount();
  await (
    await contract.createPolicy(
      600n,
      40n,
      await encryptUint64(96n),
      makeFeedBytes32(SCENARIO.activePolicy.feed),
      SCENARIO.activePolicy.direction,
      expiry,
      signerAddress
    )
  ).wait();

  await (await contract.cancelPolicy(policyId)).wait();
}

function statusLabel(status: number) {
  return ["active", "pending", "triggered", "settled", "expired", "cancelled"][status] || "unknown";
}

function isScenarioPolicy(
  entry: {
    status: number;
    feed: string;
    direction: number;
    insured: string;
    beneficiary: string;
    coverage: bigint;
    premium: bigint;
  },
  scenario: { feed: string; direction: number; coverage: bigint; premium: bigint },
  statuses: number[],
  signerAddress: string
) {
  const normalizedSigner = signerAddress.toLowerCase();
  return (
    statuses.includes(entry.status) &&
    entry.insured.toLowerCase() === normalizedSigner &&
    entry.beneficiary.toLowerCase() === normalizedSigner &&
    entry.feed === makeFeedBytes32(scenario.feed) &&
    entry.direction === scenario.direction &&
    entry.coverage === scenario.coverage &&
    entry.premium === scenario.premium
  );
}

function printScenarioSummary(
  statuses: Array<{
    id: bigint;
    status: number;
    insured: string;
    beneficiary: string;
    feed: string;
    direction: number;
    coverage: bigint;
    premium: bigint;
  }>
) {
  console.log("Current policy book:");
  if (statuses.length === 0) {
    console.log("  no policies yet");
    return;
  }

  for (const entry of statuses) {
    let feed = entry.feed;
    try {
      feed = ethers.decodeBytes32String(entry.feed);
    } catch {}
    console.log(
      `  #${entry.id.toString()} ${statusLabel(entry.status)} insured=${entry.insured} beneficiary=${entry.beneficiary} feed=${feed} direction=${entry.direction} coverage=${entry.coverage.toString()} premium=${entry.premium.toString()}`
    );
  }
}

async function waitForDecisionReady(contract: any, policyId: bigint, options?: { attempts?: number; delayMs?: number }) {
  const attempts = options?.attempts ?? 60;
  const delayMs = options?.delayMs ?? 5000;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const [ready] = await contract.finalizePolicyEvaluation.staticCall(policyId);
    if (ready) {
      return;
    }

    console.log(`Waiting for finalize readiness on policy ${policyId.toString()}...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Policy ${policyId.toString()} did not become ready in time.`);
}

async function main() {
  if (deployment.network !== hre.network.name) {
    throw new Error(`Deployment metadata is for ${deployment.network}, but current network is ${hre.network.name}.`);
  }

  const [signer] = await ethers.getSigners();
  if (!signer) {
    throw new Error("No signer available. Check PRIVATE_KEY in .env.");
  }

  await cofhejs.initializeWithEthers({
    ethersProvider: ethers.provider,
    ethersSigner: signer,
    environment: "TESTNET",
    generatePermit: false,
  });

  const contract = await ethers.getContractAt("VeilShield", deployment.address, signer);
  const token = await ethers.getContractAt("VeilShieldDemoToken", deployment.token.address, signer);

  const owner = await contract.owner();
  const oracle = await contract.oracle();
  const signerAddress = await signer.getAddress();
  const normalizedSigner = signerAddress.toLowerCase();

  if (owner.toLowerCase() !== normalizedSigner || oracle.toLowerCase() !== normalizedSigner) {
    throw new Error(`Seed script expects signer to be owner and oracle. signer=${signerAddress} owner=${owner} oracle=${oracle}`);
  }

  const readPolicies = async () => {
    const count = Number(await contract.policyCount());
    const statuses: Array<{
      id: bigint;
      status: number;
      insured: string;
      beneficiary: string;
      feed: string;
      direction: number;
      coverage: bigint;
      premium: bigint;
    }> = [];
    for (let id = 0; id < count; id += 1) {
      const policyId = BigInt(id);
      const [policy, tokenTerms] = await Promise.all([
        contract.policies(policyId),
        contract.getPolicyTokenTerms(policyId),
      ]);
      statuses.push({
        id: policyId,
        status: Number(policy.status),
        insured: policy.insured,
        beneficiary: policy.beneficiary,
        feed: policy.oracleFeedId,
        direction: Number(policy.direction),
        coverage: BigInt(tokenTerms[0]),
        premium: BigInt(tokenTerms[1]),
      });
    }
    return statuses;
  };

  let statuses = await readPolicies();
  printScenarioSummary(statuses);
  let hasActive = statuses.some((entry) => isScenarioPolicy(entry, SCENARIO.activePolicy, [0], signerAddress));
  let hasSettled = statuses.some((entry) => isScenarioPolicy(entry, SCENARIO.settledPolicy, [3], signerAddress));
  let hasHistory = statuses.some((entry) => [3, 4, 5].includes(entry.status));

  for (const entry of statuses.filter((item) => isScenarioPolicy(item, SCENARIO.settledPolicy, [1], signerAddress))) {
    console.log(`Resuming pending decision for policy ${entry.id.toString()}...`);
    try {
      await waitForDecisionReady(contract, entry.id, { attempts: 12, delayMs: 5000 });
      await (await contract.finalizePolicyEvaluation(entry.id)).wait();
    } catch (error) {
      console.warn(`Pending policy ${entry.id.toString()} is still waiting on threshold decryption. Continuing seed flow.`);
      console.warn(error);
    }
  }

  statuses = await readPolicies();
  for (const entry of statuses.filter((item) => isScenarioPolicy(item, SCENARIO.settledPolicy, [2], signerAddress))) {
    console.log(`Settling already-triggered policy ${entry.id.toString()}...`);
    await (await contract.settleTriggeredPolicy(entry.id)).wait();
  }

  statuses = await readPolicies();
  hasActive = statuses.some((entry) => isScenarioPolicy(entry, SCENARIO.activePolicy, [0], signerAddress));
  hasSettled = statuses.some((entry) => isScenarioPolicy(entry, SCENARIO.settledPolicy, [3], signerAddress));
  hasHistory = statuses.some((entry) => [3, 4, 5].includes(entry.status));
  const hasInFlightSettledCandidate = statuses.some(
    (entry) => isScenarioPolicy(entry, SCENARIO.settledPolicy, [1, 2], signerAddress)
  );

  if (hasActive && hasSettled) {
    console.log("Canonical exporter demo already has one active policy and one settled history policy.");
    return;
  }

  const pool = await contract.pool();
  const signerBalance = await token.balanceOf(signerAddress);
  const totalNeeded =
    SCENARIO.liquidityDeposit +
    SCENARIO.activePolicy.premium +
    SCENARIO.settledPolicy.premium;

  if (signerBalance < totalNeeded) {
    console.log("Minting faucet tokens for seed signer...");
    await (await token.faucet()).wait();
  }

  const allowance = await token.allowance(signerAddress, deployment.address);
  if (allowance < totalNeeded) {
    console.log("Approving vUSD for seed operations...");
    await (await token.approve(deployment.address, ethers.MaxUint256)).wait();
  }

  if (BigInt(pool.tokenLiquidity) === 0n) {
    console.log(`Depositing ${SCENARIO.liquidityDeposit.toString()} vUSD into the pool...`);
    await (await contract.depositLiquidity(SCENARIO.liquidityDeposit)).wait();
  }

  const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14);

  if (!hasActive) {
    console.log("Creating active exporter policy...");
    await (
      await contract.createPolicy(
        SCENARIO.activePolicy.coverage,
        SCENARIO.activePolicy.premium,
        await encryptUint64(SCENARIO.activePolicy.threshold),
        makeFeedBytes32(SCENARIO.activePolicy.feed),
        SCENARIO.activePolicy.direction,
        expiry,
        signerAddress
      )
    ).wait();
  }

  if (!hasSettled && !hasInFlightSettledCandidate) {
    const beforeCreate = Number(await contract.policyCount());
    console.log("Creating settled exporter policy...");
    await (
      await contract.createPolicy(
        SCENARIO.settledPolicy.coverage,
        SCENARIO.settledPolicy.premium,
        await encryptUint64(SCENARIO.settledPolicy.threshold),
        makeFeedBytes32(SCENARIO.settledPolicy.feed),
        SCENARIO.settledPolicy.direction,
        expiry,
        signerAddress
      )
    ).wait();

    const settledPolicyId = BigInt(beforeCreate);
    console.log(`Submitting oracle reading for settled scenario on policy ${settledPolicyId.toString()}...`);
    await (
      await contract.submitOracleReading(
        makeFeedBytes32(SCENARIO.settledPolicy.feed),
        await encryptUint64(SCENARIO.settledPolicy.oracleReading)
      )
    ).wait();

    console.log("Requesting evaluation...");
    await (await contract.requestPolicyEvaluation(settledPolicyId)).wait();

    await waitForDecisionReady(contract, settledPolicyId);

    console.log("Finalizing and settling triggered claim...");
    await (await contract.finalizePolicyEvaluation(settledPolicyId)).wait();
    await (await contract.settleTriggeredPolicy(settledPolicyId)).wait();
  }

  statuses = await readPolicies();
  hasHistory = statuses.some((entry) => [3, 4, 5].includes(entry.status));

  if (!hasHistory) {
    await createCancelledHistoryPolicy(contract, signerAddress, expiry);
  }

  printScenarioSummary(await readPolicies());
  console.log("Exporter demo scenario seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
