import { ethers } from "ethers";

import contractArtifact from "../abi/VeilShield.json";
import tokenArtifact from "../abi/VeilShieldDemoToken.json";
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
export const APP_TAGLINE = "Confidential cargo delay cover for exporters";
export const EXPORTER_SCENARIO = {
  activePolicy: {
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 48,
    coverage: 1800,
    premium: 120,
  },
  settledPolicy: {
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 60,
    coverage: 2200,
    premium: 180,
    oracleReading: 72,
  },
  liquidityDeposit: 50000,
};

export const POLICY_TEMPLATES = [
  {
    id: "shipment_delay",
    label: "Shipment delay",
    description: "Container route delay above the exporter threshold.",
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 48,
    coverage: 1800,
    premium: 120,
    expiryDays: 14,
  },
  {
    id: "delivery_sla_delay",
    label: "Delivery SLA delay",
    description: "Late delivery against a customer SLA window.",
    feed: "shipment_delay_hours",
    direction: 0,
    threshold: 72,
    coverage: 2400,
    premium: 180,
    expiryDays: 21,
  },
];

export const STATUS_LABELS = {
  0: "active",
  1: "pending",
  2: "triggered",
  3: "settled",
  4: "expired",
  5: "cancelled",
};

export const FEEDS = [
  { id: "shipment_delay_hours", name: "Shipment Delay (hours)", source: "Carrier + customs oracle" },
  { id: "port_congestion_index", name: "Port Congestion Index", source: "Port telemetry oracle" },
  { id: "customs_hold_risk", name: "Customs Hold Risk", source: "Trade compliance oracle" },
  { id: "freight_rate_spike", name: "Freight Rate Spike", source: "Freight market oracle" },
].map((feed) => ({
  ...feed,
  bytes32: ethers.encodeBytes32String(feed.id),
}));

export { deployment };
