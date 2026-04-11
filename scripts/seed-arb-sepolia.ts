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
    feed: "port_congestion_index",
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

async function waitForDecisionReady(contract: any, policyId: bigint) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const [ready] = await contract.finalizePolicyEvaluation.staticCall(policyId);
    if (ready) {
      return;
    }

    console.log(`Waiting for finalize readiness on policy ${policyId.toString()}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
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

  const readStatuses = async () => {
    const count = Number(await contract.policyCount());
    const statuses: Array<{ id: bigint; status: number }> = [];
    for (let id = 0; id < count; id += 1) {
      const policy = await contract.policies(BigInt(id));
      statuses.push({ id: BigInt(id), status: Number(policy.status) });
    }
    return statuses;
  };

  let statuses = await readStatuses();
  let hasActive = statuses.some((entry) => entry.status === 0);
  let hasSettled = statuses.some((entry) => entry.status === 3);

  for (const entry of statuses.filter((item) => item.status === 1)) {
    console.log(`Resuming pending decision for policy ${entry.id.toString()}...`);
    await waitForDecisionReady(contract, entry.id);
    await (await contract.finalizePolicyEvaluation(entry.id)).wait();
  }

  statuses = await readStatuses();
  for (const entry of statuses.filter((item) => item.status === 2)) {
    console.log(`Settling already-triggered policy ${entry.id.toString()}...`);
    await (await contract.settleTriggeredPolicy(entry.id)).wait();
  }

  statuses = await readStatuses();
  hasActive = statuses.some((entry) => entry.status === 0);
  hasSettled = statuses.some((entry) => entry.status === 3);

  if (hasActive && hasSettled) {
    console.log("Live scenario already seeded with at least one active and one settled policy.");
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

  if (!hasSettled) {
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

  console.log("Exporter demo scenario seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
