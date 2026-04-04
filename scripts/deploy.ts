import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import hre, { ethers } from "hardhat";

function getExplorerBaseUrl(networkName: string) {
  if (networkName === "arb-sepolia") {
    return "https://sepolia.arbiscan.io/address/";
  }
  if (networkName === "eth-sepolia") {
    return "https://sepolia.etherscan.io/address/";
  }
  if (networkName === "base-sepolia") {
    return "https://sepolia.basescan.org/address/";
  }
  return "";
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const oracle = process.env.ORACLE_ADDRESS;
  const oracleAddress = oracle && ethers.isAddress(oracle) ? oracle : deployer.address;
  const explorerBaseUrl = getExplorerBaseUrl(hre.network.name);

  console.log(`Deploying with ${deployer.address} on ${hre.network.name} (${network.chainId.toString()})`);
  console.log(`Oracle address: ${oracleAddress}`);

  const DemoToken = await ethers.getContractFactory("VeilShieldDemoToken");
  const demoToken = await DemoToken.deploy(deployer.address);
  await demoToken.waitForDeployment();
  const demoTokenAddress = await demoToken.getAddress();

  console.log(`VeilShieldDemoToken deployed at ${demoTokenAddress}`);

  const VeilShield = await ethers.getContractFactory("VeilShield");
  const veilShield = await VeilShield.deploy(oracleAddress, demoTokenAddress);
  await veilShield.waitForDeployment();
  const veilShieldAddress = await veilShield.getAddress();

  console.log(`VeilShield deployed at ${veilShieldAddress}`);

  const deployment = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    contractName: "VeilShield",
    address: veilShieldAddress,
    oracle: oracleAddress,
    deployer: deployer.address,
    explorer: explorerBaseUrl ? `${explorerBaseUrl}${veilShieldAddress}` : "",
    token: {
      contractName: "VeilShieldDemoToken",
      address: demoTokenAddress,
      symbol: "vUSD",
      decimals: 0,
      faucetAmount: 100000,
      explorer: explorerBaseUrl ? `${explorerBaseUrl}${demoTokenAddress}` : "",
    },
  };

  const deploymentPath = resolve(process.cwd(), "deployments", `${hre.network.name}.json`);
  mkdirSync(resolve(process.cwd(), "deployments"), { recursive: true });
  writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

  console.log(`Deployment metadata written to ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
