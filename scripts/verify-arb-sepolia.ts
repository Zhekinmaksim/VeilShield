import "dotenv/config";
import hre from "hardhat";
import deployment from "../deployments/arb-sepolia.json";

async function main() {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("Set ETHERSCAN_API_KEY in .env before running verification.");
  }

  console.log(`Verifying ${deployment.token.contractName} at ${deployment.token.address} on ${deployment.network}`);

  await hre.run("verify:verify", {
    address: deployment.token.address,
    constructorArguments: [deployment.deployer]
  });

  console.log(`Verifying ${deployment.contractName} at ${deployment.address} on ${deployment.network}`);

  await hre.run("verify:verify", {
    address: deployment.address,
    constructorArguments: [deployment.oracle, deployment.token.address]
  });

  console.log("Verification requests submitted successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
