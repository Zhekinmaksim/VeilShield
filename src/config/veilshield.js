import { ethers } from "ethers";

import contractArtifact from "../../artifacts/contracts/VeilShield.sol/VeilShield.json";
import tokenArtifact from "../../artifacts/contracts/VeilShieldDemoToken.sol/VeilShieldDemoToken.json";
import deployment from "../../deployments/arb-sepolia.json";

export const CONTRACT_ADDRESS = deployment.address;
export const CONTRACT_ABI = contractArtifact.abi;
export const EXPLORER_URL = deployment.explorer;
export const TOKEN_ADDRESS = deployment.token?.address || ethers.ZeroAddress;
export const TOKEN_ABI = tokenArtifact.abi;
export const TOKEN_SYMBOL = deployment.token?.symbol || "vUSD";
export const TOKEN_DECIMALS = deployment.token?.decimals ?? 0;
export const TOKEN_EXPLORER_URL = deployment.token?.explorer || "";
export const TOKEN_FAUCET_AMOUNT = deployment.token?.faucetAmount ?? 100000;
export const ARB_SEPOLIA_CHAIN_ID = 421614;
export const ARB_SEPOLIA_HEX = "0x66eee";
export const ARB_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";

export const STATUS_LABELS = {
  0: "active",
  1: "pending",
  2: "triggered",
  3: "settled",
  4: "expired",
  5: "cancelled",
};

export const FEEDS = [
  { id: "eth_usd", name: "ETH/USD Price", source: "Chainlink" },
  { id: "bdi", name: "Baltic Dry Index", source: "Chainlink" },
  { id: "temp_fra", name: "Temperature (FRA)", source: "Custom" },
  { id: "usdc_peg", name: "USDC Peg Index", source: "Chainlink" },
].map((feed) => ({
  ...feed,
  bytes32: ethers.encodeBytes32String(feed.id),
}));

export { deployment };
