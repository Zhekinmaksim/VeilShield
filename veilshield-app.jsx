import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { cofhejs, Encryptable, FheTypes } from "cofhejs/web";

import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  TOKEN_ABI,
  TOKEN_ADDRESS,
  TOKEN_EXPLORER_URL,
  TOKEN_SYMBOL,
  TOKEN_FAUCET_AMOUNT,
  ARB_SEPOLIA_CHAIN_ID,
  ARB_SEPOLIA_HEX,
  ARB_SEPOLIA_RPC,
  STATUS_LABELS,
  FEEDS,
  deployment,
} from "./src/config/veilshield.js";

const PUBLIC_PROVIDER = new ethers.JsonRpcProvider(ARB_SEPOLIA_RPC);

const T = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F5F0",
  border: "#E5E5E0",
  borderStrong: "#D0D0CB",
  text: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#9B9B9B",
  accent: "#1B5E3B",
  accentLight: "#E8F5EE",
  accentMuted: "#F1F7F3",
  accentBorder: "#D8E7DD",
  accentDark: "#0F3D26",
  warning: "#C4841D",
  warningLight: "#FFF8EC",
  danger: "#B83232",
  dangerLight: "#FFF0F0",
  success: "#1B5E3B",
  mono: "'IBM Plex Mono', 'Menlo', monospace",
  sans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  radius: "3px",
};

const css = {
  root: {
    fontFamily: T.sans,
    color: T.text,
    background: T.bg,
    minHeight: "100vh",
    fontSize: "14px",
    lineHeight: "1.5",
    WebkitFontSmoothing: "antialiased",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
    gap: "16px",
    flexWrap: "wrap",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoMark: {
    width: "28px",
    height: "28px",
    background: T.accent,
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: T.mono,
  },
  logoText: {
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  nav: {
    display: "flex",
    gap: "2px",
    flexWrap: "wrap",
  },
  navItem: (active) => ({
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    color: active ? T.accent : T.textSecondary,
    background: active ? T.accentLight : "transparent",
    borderRadius: T.radius,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  walletBtn: {
    padding: "7px 16px",
    fontSize: "12px",
    fontFamily: T.mono,
    background: T.text,
    color: "#fff",
    border: "none",
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  walletBtnSecondary: {
    padding: "7px 16px",
    fontSize: "12px",
    fontFamily: T.mono,
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  main: {
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "32px",
  },
  card: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    overflow: "hidden",
  },
  cardHeader: {
    padding: "16px 20px",
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: T.textSecondary,
  },
  cardBody: {
    padding: "20px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: T.textTertiary,
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: 600,
    fontFamily: T.mono,
    letterSpacing: "-0.02em",
  },
  statEncrypted: {
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: T.mono,
    letterSpacing: "0.01em",
    color: T.accentDark,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: T.accentMuted,
    border: `1px solid ${T.accentBorder}`,
    borderRadius: T.radius,
    padding: "5px 8px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: T.textTertiary,
    borderBottom: `1px solid ${T.border}`,
    background: T.surfaceAlt,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 16px",
    fontSize: "13px",
    borderBottom: `1px solid ${T.border}`,
    fontFamily: T.mono,
    verticalAlign: "top",
  },
  tdText: {
    padding: "12px 16px",
    fontSize: "13px",
    borderBottom: `1px solid ${T.border}`,
    verticalAlign: "top",
  },
  badge: (variant) => {
    const colors = {
      active: { bg: T.accentLight, color: T.accent },
      pending: { bg: T.warningLight, color: T.warning },
      triggered: { bg: T.warningLight, color: T.warning },
      settled: { bg: "#F0F0F0", color: T.textSecondary },
      expired: { bg: "#F0F0F0", color: T.textTertiary },
      cancelled: { bg: T.dangerLight, color: T.danger },
    };
    const c = colors[variant] || colors.active;
    return {
      display: "inline-block",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      borderRadius: "2px",
      background: c.bg,
      color: c.color,
      whiteSpace: "nowrap",
    };
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: T.textSecondary,
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: T.mono,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    background: T.surface,
    color: T.text,
    boxSizing: "border-box",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "13px",
    fontFamily: T.mono,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    background: T.surface,
    color: T.text,
    boxSizing: "border-box",
    outline: "none",
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: 600,
    background: T.accent,
    color: "#fff",
    border: "none",
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  btnSecondary: {
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: 500,
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: T.radius,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "6px 12px",
    fontSize: "11px",
    fontWeight: 600,
    background: "transparent",
    color: T.accent,
    border: `1px solid ${T.accentBorder}`,
    borderRadius: T.radius,
    cursor: "pointer",
    fontFamily: T.mono,
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  cipher: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: T.mono,
    fontSize: "12px",
    color: T.accentDark,
    background: T.accentMuted,
    border: `1px solid ${T.accentBorder}`,
    padding: "2px 7px",
    borderRadius: "2px",
    letterSpacing: "0.02em",
  },
  encryptedMeta: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "2px 8px",
    borderRadius: "2px",
    border: `1px solid ${T.accentBorder}`,
    background: T.accentMuted,
    color: T.accentDark,
    fontFamily: T.mono,
    fontSize: "11px",
  },
  muted: {
    color: T.textTertiary,
    fontSize: "12px",
  },
  callout: {
    padding: "12px 16px",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    background: T.surfaceAlt,
    fontSize: "12px",
    color: T.textSecondary,
  },
  deploymentBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 16px",
    marginBottom: "24px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    flexWrap: "wrap",
  },
  deploymentMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    fontSize: "12px",
  },
  deploymentLabel: {
    color: T.textTertiary,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontSize: "11px",
    fontWeight: 600,
  },
  deploymentValue: {
    fontFamily: T.mono,
    color: T.textSecondary,
  },
  deploymentPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px",
    border: `1px solid ${T.accentBorder}`,
    background: T.accentMuted,
    color: T.accentDark,
    borderRadius: T.radius,
    fontFamily: T.mono,
    fontSize: "11px",
  },
  statusStrip: {
    padding: "10px 14px",
    borderRadius: T.radius,
    fontSize: "12px",
    marginBottom: "20px",
  },
  toastViewport: {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "min(360px, calc(100vw - 32px))",
  },
  toast: (variant) => {
    const variants = {
      loading: { bg: T.surface, border: T.borderStrong, color: T.text },
      success: { bg: T.accentLight, border: T.accentBorder, color: T.accentDark },
      error: { bg: T.dangerLight, border: "#F3CACA", color: T.danger },
      info: { bg: T.surfaceAlt, border: T.border, color: T.textSecondary },
      pending: { bg: T.warningLight, border: "#F1DFC0", color: T.warning },
    };
    const selected = variants[variant] || variants.info;
    return {
      background: selected.bg,
      border: `1px solid ${selected.border}`,
      color: selected.color,
      borderRadius: T.radius,
      padding: "12px 14px",
      boxShadow: "0 12px 30px rgba(26, 26, 26, 0.08)",
    };
  },
  toastTitle: {
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "4px",
  },
  toastBody: {
    fontSize: "12px",
    lineHeight: "1.5",
  },
  inlineStatus: {
    marginTop: "10px",
    padding: "8px 10px",
    borderRadius: T.radius,
    fontSize: "11px",
    fontFamily: T.mono,
    background: T.surfaceAlt,
    color: T.textSecondary,
    border: `1px solid ${T.border}`,
  },
  footer: {
    padding: "24px 32px",
    borderTop: `1px solid ${T.border}`,
    textAlign: "center",
    fontSize: "12px",
    color: T.textTertiary,
    background: T.surface,
  },
  link: {
    color: T.accent,
    textDecoration: "none",
    fontWeight: 600,
  },
};

function makeFeedBytes32(id) {
  return ethers.encodeBytes32String(id);
}

function unwrapResult(result, label) {
  if (!result.success) {
    throw new Error(`${label}: ${result.error || "unknown error"}`);
  }
  return result.data;
}

function shortAddress(value) {
  if (!value) {
    return "not connected";
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTimestamp(value) {
  if (!value) {
    return "n/a";
  }
  return new Date(Number(value) * 1000).toISOString().slice(0, 10);
}

function formatToken(value) {
  if (value === undefined || value === null || value === "") {
    return "0";
  }
  return BigInt(value).toString();
}

function formatAllowanceDisplay(value) {
  const allowance = BigInt(value || "0");
  if (allowance >= ethers.MaxUint256 / 2n) {
    return "unlimited";
  }
  return allowance.toString();
}

function formatCipher(handle) {
  if (handle === undefined || handle === null) {
    return "0x0";
  }
  const hex = ethers.toBeHex(BigInt(handle));
  if (hex.length <= 14) {
    return hex;
  }
  return `${hex.slice(0, 8)}...${hex.slice(-4)}`;
}

function decodeFeed(bytes32Value) {
  const match = FEEDS.find((feed) => feed.bytes32 === bytes32Value);
  if (match) {
    return match.name;
  }
  try {
    return ethers.decodeBytes32String(bytes32Value);
  } catch {
    return bytes32Value;
  }
}

function normalizeEncryptedInput(input) {
  return {
    ctHash: input.ctHash,
    securityZone: input.securityZone,
    utype: input.utype,
    signature: input.signature,
  };
}

function getErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return (
    error?.shortMessage ||
    error?.reason ||
    error?.message ||
    error?.info?.error?.message ||
    fallback
  );
}

function classifyDecryptError(error) {
  const message = getErrorMessage(error, "Decrypt failed.");
  const normalized = message.toLowerCase();

  if (
    normalized.includes("not ready") ||
    normalized.includes("decrypt request failed") ||
    normalized.includes("sealoutput request failed") ||
    normalized.includes("returned null")
  ) {
    return {
      kind: "pending",
      message: "Threshold network result is not ready yet. Retry in a few seconds.",
    };
  }

  if (normalized.includes("permit")) {
    return {
      kind: "permit",
      message: "Decrypt permit is missing or stale. Reconnect wallet and try again.",
    };
  }

  if (normalized.includes("not authorized") || normalized.includes("execution reverted")) {
    return {
      kind: "forbidden",
      message: "Connected wallet is not allowed to decrypt this value.",
    };
  }

  return {
    kind: "error",
    message,
  };
}

function classifyFinalizeResult(result) {
  if (!result) {
    return {
      kind: "error",
      message: "No finalize result returned.",
    };
  }

  if (!result.ready) {
    return {
      kind: "pending",
      message: "Policy decision is not decrypted yet. Wait a bit before finalizing.",
    };
  }

  return {
    kind: result.triggered ? "triggered" : "active",
    message: result.triggered
      ? "Policy finalized and moved to triggered state."
      : "Policy finalized and remains active.",
  };
}

function LockIcon({ size = 14, color = T.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ShieldIcon({ size = 14, color = T.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 6.5 3-1 5.5-3 5.5-6.5V4L8 1.5z" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M6 8l1.5 1.5L10 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EncryptedValue({ value }) {
  return (
    <span style={css.cipher}>
      <LockIcon size={10} color={T.accent} /> {formatCipher(value)}
    </span>
  );
}

async function ensureArbitrumSepolia() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARB_SEPOLIA_HEX }],
    });
  } catch (error) {
    if (error && error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ARB_SEPOLIA_HEX,
            chainName: "Arbitrum Sepolia",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [ARB_SEPOLIA_RPC],
            blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
          },
        ],
      });
      return;
    }
    throw error;
  }
}

async function initializeCofhe(browserProvider, signer) {
  unwrapResult(
    await cofhejs.initializeWithEthers({
      ethersProvider: browserProvider,
      ethersSigner: signer,
      environment: "TESTNET",
      generatePermit: true,
    }),
    "CoFHE initialize"
  );

  const existingPermit = cofhejs.getPermit();
  if (!existingPermit.success) {
    unwrapResult(await cofhejs.createPermit(), "Permit creation");
  }
}

async function encryptUint64(value) {
  const encrypted = unwrapResult(
    await cofhejs.encrypt([Encryptable.uint64(BigInt(value).toString())]),
    "Encryption failed"
  );
  return normalizeEncryptedInput(encrypted[0]);
}

async function decryptUint64(handle) {
  return unwrapResult(await cofhejs.decrypt(BigInt(handle), FheTypes.Uint64), "Decrypt failed");
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [provider, setProvider] = useState(PUBLIC_PROVIDER);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(ARB_SEPOLIA_CHAIN_ID);
  const [walletReady, setWalletReady] = useState(false);
  const [cofheReady, setCofheReady] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [txStates, setTxStates] = useState({});
  const [protocol, setProtocol] = useState({
    pool: null,
    owner: "",
    oracle: "",
    asset: TOKEN_ADDRESS,
    availableLiquidityTokens: "0",
    policyCount: 0,
    policies: [],
    feeds: [],
  });
  const [userState, setUserState] = useState({
    tokenBalance: "0",
    allowance: "0",
    lpBalanceHandle: null,
    lpBalancePlaintext: "",
    lpTokenBalance: "0",
    myPolicies: [],
    decryptedPolicies: {},
  });
  const [policyForm, setPolicyForm] = useState({
    feed: FEEDS[0].id,
    direction: "0",
    coverage: "",
    premium: "",
    threshold: "",
    expiry: "",
    beneficiary: "",
  });
  const [policyPreview, setPolicyPreview] = useState(null);
  const [poolForm, setPoolForm] = useState({
    deposit: "",
    withdraw: "",
  });
  const [oracleForm, setOracleForm] = useState({
    feed: FEEDS[0].id,
    reading: "",
  });

  function pushToast(title, body, variant = "info", options = {}) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = { id, title, body, variant };
    setToasts((current) => [...current, toast]);

    if (variant !== "loading" && options.persist !== true) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((entry) => entry.id !== id));
      }, options.timeoutMs || 4500);
    }

    return id;
  }

  function updateToast(id, patch, options = {}) {
    setToasts((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    );

    if (patch.variant && patch.variant !== "loading" && options.persist !== true) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((entry) => entry.id !== id));
      }, options.timeoutMs || 4500);
    }
  }

  function isTxBusy(key) {
    return txStates[key]?.status === "loading";
  }

  function setTxStatus(key, status, message = "") {
    setTxStates((current) => ({
      ...current,
      [key]: {
        status,
        message,
      },
    }));
  }

  function getWriteContract() {
    if (!signer) {
      throw new Error("Connect wallet first.");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  function getWriteToken() {
    if (!signer) {
      throw new Error("Connect wallet first.");
    }
    if (!TOKEN_ADDRESS || TOKEN_ADDRESS === ethers.ZeroAddress) {
      throw new Error("Demo token address is not configured yet.");
    }
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  }

  async function refreshData(
    currentProvider = provider,
    currentAccount = account,
    decryptUser = true,
    currentSigner = signer
  ) {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, currentProvider);
      const tokenContract =
        TOKEN_ADDRESS && TOKEN_ADDRESS !== ethers.ZeroAddress
          ? new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, currentProvider)
          : null;

      const [pool, owner, oracle, asset, policyCountRaw, availableLiquidityTokens] = await Promise.all([
        contract.pool(),
        contract.owner(),
        contract.oracle(),
        contract.asset(),
        contract.policyCount(),
        contract.getAvailableLiquidityTokens(),
      ]);

      const policyCount = Number(policyCountRaw);
      const ids = [];
      for (let id = policyCount - 1; id >= 0 && ids.length < 12; id -= 1) {
        ids.push(BigInt(id));
      }

      const policies = await Promise.all(
        ids.map(async (id) => {
          const [policy, tokenTerms] = await Promise.all([
            contract.policies(id),
            contract.getPolicyTokenTerms(id),
          ]);
          return {
            id: Number(id),
            insured: policy.insured,
            beneficiary: policy.beneficiary,
            encCoverage: policy.encCoverage,
            encPremium: policy.encPremium,
            encThreshold: policy.encThreshold,
            oracleFeedId: policy.oracleFeedId,
            direction: Number(policy.direction),
            expiryTimestamp: policy.expiryTimestamp,
            status: Number(policy.status),
            createdAt: policy.createdAt,
            pendingPayout: policy.pendingPayout,
            coverageAmount: tokenTerms[0],
            premiumAmount: tokenTerms[1],
          };
        })
      );

      const feeds = await Promise.all(
        FEEDS.map(async (feed) => {
          const [initialized, value] = await Promise.all([
            contract.oracleFeedInitialized(feed.bytes32),
            contract.oracleValues(feed.bytes32),
          ]);
          return {
            ...feed,
            initialized,
            value,
          };
        })
      );

      setProtocol({
        pool,
        owner,
        oracle,
        asset,
        availableLiquidityTokens: formatToken(availableLiquidityTokens),
        policyCount,
        policies,
        feeds,
      });

      if (currentAccount) {
        const normalized = currentAccount.toLowerCase();
        const myPolicies = policies.filter(
          (policy) =>
            policy.insured.toLowerCase() === normalized ||
            policy.beneficiary.toLowerCase() === normalized
        );

        let lpBalanceHandle = null;
        let lpBalancePlaintext = "";
        let lpTokenBalance = "0";
        let tokenBalance = "0";
        let allowance = "0";

        try {
          const reader = contract.connect(currentSigner || currentProvider);
          const results = await Promise.allSettled([
            reader.getMyLpBalance(),
            reader.getMyLpTokenBalance(),
            tokenContract?.balanceOf(currentAccount),
            tokenContract?.allowance(currentAccount, CONTRACT_ADDRESS),
          ]);

          if (results[0].status === "fulfilled") {
            lpBalanceHandle = results[0].value;
            if (decryptUser && cofheReady) {
              lpBalancePlaintext = String(await decryptUint64(lpBalanceHandle));
            }
          }

          if (results[1].status === "fulfilled") {
            lpTokenBalance = formatToken(results[1].value);
          }

          if (results[2] && results[2].status === "fulfilled") {
            tokenBalance = formatToken(results[2].value);
          }

          if (results[3] && results[3].status === "fulfilled") {
            allowance = formatToken(results[3].value);
          }
        } catch {
          lpBalanceHandle = null;
        }

        setUserState((current) => ({
          ...current,
          tokenBalance,
          allowance,
          myPolicies,
          lpBalanceHandle,
          lpBalancePlaintext,
          lpTokenBalance,
        }));
      } else {
        setUserState({
          tokenBalance: "0",
          allowance: "0",
          lpBalanceHandle: null,
          lpBalancePlaintext: "",
          lpTokenBalance: "0",
          myPolicies: [],
          decryptedPolicies: {},
        });
      }
    } catch (loadError) {
      pushToast("State refresh failed", getErrorMessage(loadError, "Failed to load on-chain state."), "error");
    }
  }

  useEffect(() => {
    refreshData();
  }, [refreshTick]);

  useEffect(() => {
    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        setSigner(null);
        setAccount("");
        setProvider(PUBLIC_PROVIDER);
        setWalletReady(false);
        setCofheReady(false);
        setRefreshTick((value) => value + 1);
        return;
      }
      await connectWallet(true);
    };

    const handleChainChanged = async () => {
      await connectWallet(true);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length) {
          connectWallet(true).catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [cofheReady]);

  async function connectWallet(silent = false) {
    if (!window.ethereum) {
      pushToast("Wallet missing", "Install a wallet that exposes window.ethereum.", "error");
      return;
    }

    setWalletBusy(true);
    const toastId = pushToast("Wallet", "Connecting wallet and initializing CoFHE...", "loading", { persist: true });

    try {
      if (!silent) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }

      await ensureArbitrumSepolia();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const address = await walletSigner.getAddress();

      if (Number(network.chainId) !== ARB_SEPOLIA_CHAIN_ID) {
        throw new Error("Wallet is not connected to Arbitrum Sepolia.");
      }

      await initializeCofhe(browserProvider, walletSigner);

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAccount(address);
      setChainId(Number(network.chainId));
      setWalletReady(true);
      setCofheReady(true);
      updateToast(toastId, {
        title: "Wallet connected",
        body: "CoFHE encryption and decryption are ready on Arbitrum Sepolia.",
        variant: "success",
      });
      await refreshData(browserProvider, address, true, walletSigner);
    } catch (connectError) {
      updateToast(toastId, {
        title: "Wallet connection failed",
        body: getErrorMessage(connectError, "Failed to connect wallet."),
        variant: "error",
      });
    } finally {
      setWalletBusy(false);
    }
  }

  async function runAction(key, label, action, options = {}) {
    const toastId = pushToast(label, `${label} in progress...`, "loading", { persist: true });
    setTxStatus(key, "loading", `${label} in progress...`);

    try {
      const outcome = await action();
      setTxStatus(key, "success", `${label} confirmed on Arbitrum Sepolia.`);
      updateToast(toastId, {
        title: label,
        body: options.successMessage || `${label} confirmed on Arbitrum Sepolia.`,
        variant: "success",
      });
      setRefreshTick((value) => value + 1);
      return outcome;
    } catch (actionError) {
      const message = getErrorMessage(actionError, `${label} failed.`);
      setTxStatus(key, "error", message);
      updateToast(toastId, {
        title: `${label} failed`,
        body: message,
        variant: "error",
      });
      return null;
    }
  }

  async function previewPolicyEncryption() {
    if (!walletReady || !cofheReady) {
      pushToast("Encryption preview unavailable", "Connect wallet before generating encrypted preview.", "error");
      return;
    }

    try {
      const [coverage, premium, threshold] = await Promise.all([
        encryptUint64(policyForm.coverage || "0"),
        encryptUint64(policyForm.premium || "0"),
        encryptUint64(policyForm.threshold || "0"),
      ]);

      setPolicyPreview({ coverage, premium, threshold });
      pushToast("Encryption preview ready", "Preview generated from CoFHE inputs.", "success");
    } catch (previewError) {
      pushToast("Encryption preview failed", getErrorMessage(previewError, "Failed to generate encryption preview."), "error");
    }
  }

  async function handleCreatePolicy() {
    await runAction("create-policy", "Create policy", async () => {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect wallet and initialize CoFHE first.");
      }
      if (!ethers.isAddress(policyForm.beneficiary)) {
        throw new Error("Beneficiary must be a valid address.");
      }

      const writeContract = getWriteContract();
      const coverageAmount = BigInt(policyForm.coverage || "0");
      const premiumAmount = BigInt(policyForm.premium || "0");

      if (coverageAmount <= 0n || premiumAmount <= 0n) {
        throw new Error("Coverage and premium must be greater than zero.");
      }

      if (BigInt(userState.allowance || "0") < premiumAmount) {
        throw new Error(`Approve ${TOKEN_SYMBOL} before creating a policy.`);
      }

      const [encCoverage, encPremium, encThreshold] = await Promise.all([
        encryptUint64(policyForm.coverage),
        encryptUint64(policyForm.premium),
        encryptUint64(policyForm.threshold),
      ]);

      setPolicyPreview({
        coverage: encCoverage,
        premium: encPremium,
        threshold: encThreshold,
      });

      const tx = await writeContract.createPolicy(
        coverageAmount,
        premiumAmount,
        encThreshold,
        makeFeedBytes32(policyForm.feed),
        Number(policyForm.direction),
        BigInt(Math.floor(new Date(policyForm.expiry).getTime() / 1000)),
        policyForm.beneficiary
      );
      await tx.wait();
      setPolicyForm({
        feed: FEEDS[0].id,
        direction: "0",
        coverage: "",
        premium: "",
        threshold: "",
        expiry: "",
        beneficiary: "",
      });
    });
  }

  async function handleDeposit() {
    await runAction("deposit-liquidity", "Deposit liquidity", async () => {
      const amount = BigInt(poolForm.deposit || "0");
      if (amount <= 0n) {
        throw new Error("Deposit amount must be greater than zero.");
      }
      if (BigInt(userState.allowance || "0") < amount) {
        throw new Error(`Approve ${TOKEN_SYMBOL} before depositing.`);
      }

      const writeContract = getWriteContract();
      const tx = await writeContract.depositLiquidity(amount);
      await tx.wait();
      setPoolForm((current) => ({ ...current, deposit: "" }));
    });
  }

  async function handleWithdraw() {
    await runAction("withdraw-liquidity", "Withdraw liquidity", async () => {
      const amount = BigInt(poolForm.withdraw || "0");
      if (amount <= 0n) {
        throw new Error("Withdraw amount must be greater than zero.");
      }

      const writeContract = getWriteContract();
      const tx = await writeContract.withdrawLiquidity(amount);
      await tx.wait();
      setPoolForm((current) => ({ ...current, withdraw: "" }));
    });
  }

  async function handleTokenApprove() {
    await runAction("approve-token", `Approve ${TOKEN_SYMBOL}`, async () => {
      const token = getWriteToken();
      const tx = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
      await tx.wait();
    }, {
      successMessage: `${TOKEN_SYMBOL} allowance updated for the live VeilShield contract.`,
    });
  }

  async function handleTokenFaucet() {
    await runAction("token-faucet", `${TOKEN_SYMBOL} faucet`, async () => {
      const token = getWriteToken();
      const tx = await token.faucet();
      await tx.wait();
    }, {
      successMessage: `${TOKEN_FAUCET_AMOUNT.toLocaleString()} ${TOKEN_SYMBOL} minted to the connected wallet.`,
    });
  }

  async function handleOracleSubmit() {
    await runAction("oracle-submit", "Submit oracle reading", async () => {
      const writeContract = getWriteContract();
      const encrypted = await encryptUint64(oracleForm.reading);
      const tx = await writeContract.submitOracleReading(makeFeedBytes32(oracleForm.feed), encrypted);
      await tx.wait();
      setOracleForm((current) => ({ ...current, reading: "" }));
    });
  }

  async function handlePolicyAction(actionName, policyId) {
    const actionKey = `${actionName.toLowerCase().replace(/\s+/g, "-")}-${policyId}`;

    if (actionName === "Finalize evaluation") {
      try {
        const writeContract = getWriteContract();
        const [ready, triggered] = await writeContract.finalizePolicyEvaluation.staticCall(policyId);
        const classification = classifyFinalizeResult({ ready, triggered });

        if (!ready) {
          setTxStatus(actionKey, "pending", classification.message);
          pushToast("Finalize pending", classification.message, "pending");
          return;
        }
      } catch (preflightError) {
        pushToast("Finalize preflight failed", getErrorMessage(preflightError, "Unable to simulate finalize."), "error");
        return;
      }
    }

    await runAction(actionKey, actionName, async () => {
      const writeContract = getWriteContract();
      let tx;
      if (actionName === "Request evaluation") {
        tx = await writeContract.requestPolicyEvaluation(policyId);
      } else if (actionName === "Finalize evaluation") {
        tx = await writeContract.finalizePolicyEvaluation(policyId);
      } else if (actionName === "Settle policy") {
        tx = await writeContract.settleTriggeredPolicy(policyId);
      } else {
        tx = await writeContract.cancelPolicy(policyId);
      }
      await tx.wait();
    }, {
      successMessage:
        actionName === "Request evaluation"
          ? "Policy evaluation requested. Wait for threshold decryption before finalizing."
          : undefined,
    });
  }

  async function decryptMyLpBalance() {
    const toastId = pushToast("Decrypt LP balance", "Decrypting LP balance through the threshold network...", "loading", { persist: true });
    setTxStatus("decrypt-lp-balance", "loading", "Decrypt request in progress...");
    try {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect wallet before decrypting.");
      }
      const handle = await getWriteContract().getMyLpBalance();
      const plaintext = await decryptUint64(handle);
      setUserState((current) => ({
        ...current,
        lpBalanceHandle: handle,
        lpBalancePlaintext: String(plaintext),
      }));
      setTxStatus("decrypt-lp-balance", "success", "LP balance decrypted.");
      updateToast(toastId, {
        title: "LP balance decrypted",
        body: "LP balance decrypted through the CoFHE threshold network.",
        variant: "success",
      });
    } catch (decryptError) {
      const classified = classifyDecryptError(decryptError);
      setTxStatus("decrypt-lp-balance", classified.kind, classified.message);
      updateToast(toastId, {
        title: classified.kind === "pending" ? "LP balance pending" : "LP balance decrypt failed",
        body: classified.message,
        variant: classified.kind === "pending" ? "pending" : "error",
      });
    }
  }

  async function decryptMyPolicy(policyId) {
    const stateKey = `decrypt-policy-${policyId}`;
    const toastId = pushToast("Decrypt policy", `Decrypting policy ${policyId} for the connected wallet...`, "loading", { persist: true });
    setTxStatus(stateKey, "loading", `Decrypting policy ${policyId}...`);
    try {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect wallet before decrypting.");
      }

      const writeContract = getWriteContract();
      let coverage = "";
      let premium = "";
      let threshold = "";
      let payout = "";

      try {
        const terms = await writeContract.getMyPolicyTerms(policyId);
        const decryptedTerms = await Promise.all([
          decryptUint64(terms[0]),
          decryptUint64(terms[1]),
          decryptUint64(terms[2]),
        ]);
        coverage = String(decryptedTerms[0]);
        premium = String(decryptedTerms[1]);
        threshold = String(decryptedTerms[2]);
      } catch {
        coverage = "insured-only";
        premium = "insured-only";
        threshold = "insured-only";
      }

      try {
        const payoutHandle = await writeContract.getMyPendingPayout(policyId);
        payout = String(await decryptUint64(payoutHandle));
      } catch (payoutError) {
        const classified = classifyDecryptError(payoutError);
        payout = classified.kind === "pending" ? "pending threshold result" : classified.message;
      }

      setUserState((current) => ({
        ...current,
        decryptedPolicies: {
          ...current.decryptedPolicies,
          [policyId]: {
            coverage,
            premium,
            threshold,
            payout,
          },
        },
      }));
      setTxStatus(stateKey, "success", `Policy ${policyId} decrypted.`);
      updateToast(toastId, {
        title: "Policy decrypted",
        body: `Policy ${policyId} decrypted for the connected wallet.`,
        variant: "success",
      });
    } catch (decryptError) {
      const classified = classifyDecryptError(decryptError);
      setTxStatus(stateKey, classified.kind, classified.message);
      updateToast(toastId, {
        title: classified.kind === "pending" ? "Policy decrypt pending" : "Policy decrypt failed",
        body: classified.message,
        variant: classified.kind === "pending" ? "pending" : "error",
      });
    }
  }

  const pages = {
    dashboard: (
      <DashboardPage
        protocol={protocol}
        account={account}
        onPolicyAction={handlePolicyAction}
        onDecryptPolicy={decryptMyPolicy}
        userState={userState}
        walletReady={walletReady}
        txStates={txStates}
      />
    ),
    create: (
      <CreatePolicyPage
        form={policyForm}
        setForm={setPolicyForm}
        preview={policyPreview}
        onPreview={previewPolicyEncryption}
        onSubmit={handleCreatePolicy}
        onApprove={handleTokenApprove}
        walletReady={walletReady}
        cofheReady={cofheReady}
        userState={userState}
        txStates={txStates}
      />
    ),
    pool: (
      <PoolPage
        pool={protocol.pool}
        availableLiquidityTokens={protocol.availableLiquidityTokens}
        form={poolForm}
        setForm={setPoolForm}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onDecryptBalance={decryptMyLpBalance}
        onApprove={handleTokenApprove}
        onFaucet={handleTokenFaucet}
        userState={userState}
        walletReady={walletReady}
        txStates={txStates}
      />
    ),
    oracles: (
      <OraclePage
        feeds={protocol.feeds}
        oracle={protocol.oracle}
        account={account}
        form={oracleForm}
        setForm={setOracleForm}
        onSubmit={handleOracleSubmit}
        walletReady={walletReady}
        txStates={txStates}
      />
    ),
  };

  return (
    <div style={css.root}>
      <header style={css.header}>
        <div style={css.logo}>
          <div style={css.logoMark}>VS</div>
          <span style={css.logoText}>VeilShield</span>
          <span style={{ fontSize: "11px", color: T.textTertiary, fontFamily: T.mono, marginLeft: "4px" }}>
            live
          </span>
        </div>
        <nav style={css.nav}>
          {[
            ["dashboard", "Dashboard"],
            ["create", "New Policy"],
            ["pool", "Liquidity Pool"],
            ["oracles", "Oracles"],
          ].map(([key, label]) => (
            <button key={key} style={css.navItem(page === key)} onClick={() => setPage(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div style={css.buttonRow}>
          {!walletReady && (
            <button style={css.walletBtn} onClick={() => connectWallet(false)} disabled={walletBusy}>
              {walletBusy ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
          {walletReady && (
            <button style={css.walletBtnSecondary} onClick={() => refreshData(provider, account, true)} disabled={walletBusy}>
              {shortAddress(account)}
            </button>
          )}
        </div>
      </header>

      <main style={css.main}>
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 4px", letterSpacing: "-0.01em" }}>
              {page === "dashboard" && "Protocol Overview"}
              {page === "create" && "Create Policy"}
              {page === "pool" && "Liquidity Pool"}
              {page === "oracles" && "Oracle Feeds"}
            </h1>
            <p style={{ fontSize: "13px", color: T.textSecondary, margin: 0 }}>
              {page === "dashboard" && "State from the current Arbitrum Sepolia deployment"}
              {page === "create" && "Encrypt policy terms in the browser, then pay premium in vUSD"}
              {page === "pool" && "Mint vUSD, approve it once, then manage your LP position"}
              {page === "oracles" && "Check encrypted feed handles and submit readings from the oracle wallet"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: chainId === ARB_SEPOLIA_CHAIN_ID ? T.accent : T.warning, fontFamily: T.mono }}>
            <ShieldIcon size={14} color={chainId === ARB_SEPOLIA_CHAIN_ID ? T.accent : T.warning} />
            <span>{chainId === ARB_SEPOLIA_CHAIN_ID ? "Arbitrum Sepolia" : `Chain ${chainId}`}</span>
          </div>
        </div>

        <div style={css.deploymentBar}>
          <div style={css.deploymentMeta}>
            <span style={css.deploymentLabel}>Live Deployment</span>
            <span style={css.deploymentPill}>
              <ShieldIcon size={12} color={T.accent} />
              Arbitrum Sepolia
            </span>
            <span style={css.deploymentValue}>Contract {shortAddress(CONTRACT_ADDRESS)}</span>
            <span style={css.deploymentValue}>{TOKEN_SYMBOL} {shortAddress(TOKEN_ADDRESS)}</span>
            <span style={css.deploymentValue}>Oracle {shortAddress(protocol.oracle || deployment.oracle)}</span>
            <span style={css.deploymentValue}>Policies {protocol.policyCount}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <a href={EXPLORER_URL} target="_blank" rel="noreferrer" style={css.link}>
              Contract
            </a>
            {TOKEN_EXPLORER_URL && (
              <a href={TOKEN_EXPLORER_URL} target="_blank" rel="noreferrer" style={css.link}>
                Token
              </a>
            )}
          </div>
        </div>

        {pages[page]}
      </main>

      <div style={css.toastViewport}>
        {toasts.map((toast) => (
          <div key={toast.id} style={css.toast(toast.variant)}>
            <div style={css.toastTitle}>{toast.title}</div>
            <div style={css.toastBody}>{toast.body}</div>
          </div>
        ))}
      </div>

      <footer style={css.footer}>
        VeilShield Protocol — Confidential Parametric Insurance — {shortAddress(CONTRACT_ADDRESS)} on Arbitrum Sepolia
      </footer>
    </div>
  );
}

function DashboardPage({ protocol, account, onPolicyAction, onDecryptPolicy, userState, walletReady, txStates = {} }) {
  return (
    <div>
      <div style={{ ...css.grid4, marginBottom: "24px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Pool TVL ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{protocol.pool ? formatToken(protocol.pool.tokenLiquidity) : "0"}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Available ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{protocol.availableLiquidityTokens}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Reserved ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{protocol.pool ? formatToken(protocol.pool.tokenReserved) : "0"}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Encrypted TVL Handle</div>
            {protocol.pool ? (
              <div style={css.statEncrypted}>
                <LockIcon size={14} color={T.accent} />
                <span>{formatCipher(protocol.pool.encTotalDeposits)}</span>
              </div>
            ) : (
              <div style={css.muted}>loading</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...css.grid4, marginBottom: "24px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Reserved Handle</div>
            {protocol.pool ? (
              <div style={css.statEncrypted}>
                <LockIcon size={14} color={T.accent} />
                <span>{formatCipher(protocol.pool.encTotalReserved)}</span>
              </div>
            ) : (
              <div style={css.muted}>loading</div>
            )}
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Active Policies</div>
            <div style={css.statValue}>
              {protocol.policies.filter((policy) => Number(policy.status) === 0).length}
            </div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>LP Count</div>
            <div style={css.statValue}>{protocol.pool ? String(protocol.pool.lpCount) : "0"}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Your Wallet ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{walletReady ? userState.tokenBalance : "0"}</div>
          </div>
        </div>
      </div>

      <div style={css.card}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Recent Policies</span>
          <span style={css.muted}>Contract {shortAddress(CONTRACT_ADDRESS)}</span>
        </div>
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>ID</th>
                <th style={css.th}>Oracle Feed</th>
                <th style={css.th}>Coverage ({TOKEN_SYMBOL})</th>
                <th style={css.th}>Premium ({TOKEN_SYMBOL})</th>
                <th style={css.th}>Coverage Handle</th>
                <th style={css.th}>Premium Handle</th>
                <th style={css.th}>Threshold</th>
                <th style={css.th}>Status</th>
                <th style={css.th}>Expiry</th>
                <th style={css.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {protocol.policies.length === 0 && (
                <tr>
                  <td colSpan="10" style={css.tdText}>No policies on-chain yet.</td>
                </tr>
              )}
              {protocol.policies.map((policy) => {
                const status = STATUS_LABELS[policy.status] || "unknown";
                const isMine =
                  account &&
                  (policy.insured.toLowerCase() === account.toLowerCase() ||
                    policy.beneficiary.toLowerCase() === account.toLowerCase());
                const decrypted = userState.decryptedPolicies[policy.id];
                const requestKey = `request-evaluation-${policy.id}`;
                const finalizeKey = `finalize-evaluation-${policy.id}`;
                const settleKey = `settle-policy-${policy.id}`;
                const decryptKey = `decrypt-policy-${policy.id}`;
                const inlineState =
                  txStates[requestKey] ||
                  txStates[finalizeKey] ||
                  txStates[settleKey] ||
                  txStates[decryptKey];

                return (
                  <tr key={policy.id}>
                    <td style={css.td}>#{policy.id}</td>
                    <td style={css.tdText}>{decodeFeed(policy.oracleFeedId)}</td>
                    <td style={css.td}>{formatToken(policy.coverageAmount)}</td>
                    <td style={css.td}>{formatToken(policy.premiumAmount)}</td>
                    <td style={css.td}><EncryptedValue value={policy.encCoverage} /></td>
                    <td style={css.td}><EncryptedValue value={policy.encPremium} /></td>
                    <td style={css.td}><EncryptedValue value={policy.encThreshold} /></td>
                    <td style={css.tdText}>
                      <span style={css.badge(status)}>{status}</span>
                    </td>
                    <td style={css.td}>{formatTimestamp(policy.expiryTimestamp)}</td>
                    <td style={css.tdText}>
                      <div style={css.buttonRow}>
                        {walletReady && policy.status === 0 && (
                          <button
                            style={css.btnGhost}
                            disabled={txStates[requestKey]?.status === "loading"}
                            onClick={() => onPolicyAction("Request evaluation", policy.id)}
                          >
                            Evaluate
                          </button>
                        )}
                        {walletReady && policy.status === 1 && (
                          <button
                            style={css.btnGhost}
                            disabled={txStates[finalizeKey]?.status === "loading"}
                            onClick={() => onPolicyAction("Finalize evaluation", policy.id)}
                          >
                            Finalize
                          </button>
                        )}
                        {walletReady && policy.status === 2 && (
                          <button
                            style={css.btnGhost}
                            disabled={txStates[settleKey]?.status === "loading"}
                            onClick={() => onPolicyAction("Settle policy", policy.id)}
                          >
                            Settle
                          </button>
                        )}
                        {walletReady && isMine && (
                          <button
                            style={css.btnGhost}
                            disabled={txStates[decryptKey]?.status === "loading"}
                            onClick={() => onDecryptPolicy(policy.id)}
                          >
                            Decrypt My View
                          </button>
                        )}
                      </div>
                      {inlineState?.message && (
                        <div style={css.inlineStatus}>{inlineState.message}</div>
                      )}
                      {decrypted && (
                        <div style={{ ...css.callout, marginTop: "10px" }}>
                          coverage {decrypted.coverage} | premium {decrypted.premium} | threshold {decrypted.threshold}
                          {decrypted.payout !== "" ? ` | payout ${decrypted.payout}` : ""}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreatePolicyPage({
  form,
  setForm,
  preview,
  onPreview,
  onSubmit,
  onApprove,
  walletReady,
  cofheReady,
  userState,
  txStates = {},
}) {
  const createState = txStates["create-policy"];
  const approveState = txStates["approve-token"];
  const hasAllowance = BigInt(userState.allowance || "0") > 0n;

  return (
    <div style={css.grid2}>
      <div style={css.card}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>New Policy</span>
        </div>
        <div style={css.cardBody}>
          <div style={css.formGroup}>
            <label style={css.label}>Oracle Feed</label>
            <select style={css.select} value={form.feed} onChange={(event) => setForm({ ...form, feed: event.target.value })}>
              {FEEDS.map((feed) => (
                <option key={feed.id} value={feed.id}>{feed.name}</option>
              ))}
            </select>
          </div>
          <div style={css.formGroup}>
            <label style={css.label}>Trigger Direction</label>
            <select style={css.select} value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value })}>
              <option value="0">≥ (oracle above threshold)</option>
              <option value="1">≤ (oracle below threshold)</option>
            </select>
          </div>
          <div style={css.formGroup}>
            <label style={css.label}>Trigger Threshold</label>
            <input style={css.input} type="number" placeholder="e.g. 2500" value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} />
          </div>
          <div style={css.grid2}>
            <div style={css.formGroup}>
              <label style={css.label}>Coverage Amount</label>
              <input style={css.input} type="number" placeholder="e.g. 10000" value={form.coverage} onChange={(event) => setForm({ ...form, coverage: event.target.value })} />
            </div>
            <div style={css.formGroup}>
              <label style={css.label}>Premium</label>
              <input style={css.input} type="number" placeholder="e.g. 250" value={form.premium} onChange={(event) => setForm({ ...form, premium: event.target.value })} />
            </div>
          </div>
          <div style={css.formGroup}>
            <label style={css.label}>Beneficiary Address</label>
            <input style={css.input} placeholder="0x..." value={form.beneficiary} onChange={(event) => setForm({ ...form, beneficiary: event.target.value })} />
          </div>
          <div style={css.formGroup}>
            <label style={css.label}>Expiry Date</label>
            <input style={css.input} type="date" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} />
          </div>
          <div style={css.buttonRow}>
            <button style={css.btnSecondary} onClick={onApprove} disabled={approveState?.status === "loading" || !walletReady}>
              {approveState?.status === "loading" ? `Approving ${TOKEN_SYMBOL}...` : `Approve ${TOKEN_SYMBOL}`}
            </button>
            <button style={css.btnSecondary} onClick={onPreview} disabled={createState?.status === "loading"}>
              Preview Encryption
            </button>
            <button style={css.btnPrimary} onClick={onSubmit} disabled={createState?.status === "loading"}>
              {createState?.status === "loading" ? "Submitting..." : "Encrypt & Submit"}
            </button>
          </div>
          {approveState?.message && <div style={css.inlineStatus}>{approveState.message}</div>}
          {createState?.message && <div style={css.inlineStatus}>{createState.message}</div>}
          <div style={{ ...css.callout, marginTop: "12px" }}>
            {walletReady && cofheReady
              ? `Premium is funded in live ${TOKEN_SYMBOL}. Current allowance: ${formatAllowanceDisplay(userState.allowance)}. ${hasAllowance ? "Approval already set." : "Approve token spending before submitting."}`
              : "Connect a wallet on Arbitrum Sepolia to enable encryption and submission."}
          </div>
        </div>
      </div>

      <div>
        <div style={{ ...css.card, marginBottom: "16px" }}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Encryption Preview</span>
          </div>
          <div style={css.cardBody}>
            <div style={{ fontSize: "12px", color: T.textSecondary, marginBottom: "12px" }}>
              Threshold is encrypted client-side. Coverage and premium are mirrored on-chain from the public token amounts.
            </div>
            {preview ? (
              <div style={{ background: T.surfaceAlt, padding: "12px 16px", borderRadius: T.radius, fontFamily: T.mono, fontSize: "12px", lineHeight: "2" }}>
                <div><span style={{ color: T.textTertiary }}>coverage →</span> <EncryptedValue value={preview.coverage.ctHash} /></div>
                <div><span style={{ color: T.textTertiary }}>premium →</span> <EncryptedValue value={preview.premium.ctHash} /></div>
                <div><span style={{ color: T.textTertiary }}>threshold →</span> <EncryptedValue value={preview.threshold.ctHash} /></div>
              </div>
            ) : (
              <div style={css.callout}>No preview yet. Connect a wallet and generate one.</div>
            )}
          </div>
        </div>

        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Privacy Guarantees</span>
          </div>
          <div style={css.cardBody}>
            {[
              [`Coverage amount (${TOKEN_SYMBOL})`, "Public input + encrypted mirror"],
              [`Premium paid (${TOKEN_SYMBOL})`, "Public input + encrypted mirror"],
              ["Trigger threshold", "Encrypted (euint64)"],
              ["Oracle reading", "Encrypted (euint64)"],
              ["Payout result", "Encrypted (FHE.select)"],
              ["Oracle feed ID", "Public"],
              ["Expiry date", "Public"],
              ["Beneficiary", "Public"],
            ].map(([field, visibility], index) => (
              <div key={field} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: index < 7 ? `1px solid ${T.border}` : "none", fontSize: "12px", gap: "16px" }}>
                <span>{field}</span>
                {visibility === "Public" ? (
                  <span style={{ fontFamily: T.mono, color: T.textTertiary, fontSize: "11px" }}>{visibility}</span>
                ) : visibility === "Public input + encrypted mirror" ? (
                  <span style={{ fontFamily: T.mono, color: T.textSecondary, fontSize: "11px" }}>{visibility}</span>
                ) : (
                  <span style={css.encryptedMeta}>
                    <LockIcon size={10} color={T.accent} /> {visibility}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PoolPage({
  pool,
  availableLiquidityTokens,
  form,
  setForm,
  onDeposit,
  onWithdraw,
  onDecryptBalance,
  onApprove,
  onFaucet,
  userState,
  walletReady,
  txStates = {},
}) {
  const approveState = txStates["approve-token"];
  const depositState = txStates["deposit-liquidity"];
  const withdrawState = txStates["withdraw-liquidity"];
  const decryptState = txStates["decrypt-lp-balance"];
  const faucetState = txStates["token-faucet"];

  return (
    <div>
      <div style={{ ...css.grid3, marginBottom: "24px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Pool TVL ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{pool ? formatToken(pool.tokenLiquidity) : "0"}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Available ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{availableLiquidityTokens}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Reserved ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{pool ? formatToken(pool.tokenReserved) : "0"}</div>
          </div>
        </div>
      </div>

      <div style={{ ...css.grid3, marginBottom: "24px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Encrypted Deposits</div>
            {pool ? (
              <div style={css.statEncrypted}><LockIcon size={14} color={T.accent} /><span>{formatCipher(pool.encTotalDeposits)}</span></div>
            ) : (
              <div style={css.muted}>loading</div>
            )}
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Encrypted Reserved</div>
            {pool ? (
              <div style={css.statEncrypted}><LockIcon size={14} color={T.accent} /><span>{formatCipher(pool.encTotalReserved)}</span></div>
            ) : (
              <div style={css.muted}>loading</div>
            )}
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Liquidity Providers</div>
            <div style={css.statValue}>{pool ? String(pool.lpCount) : "0"}</div>
          </div>
        </div>
      </div>

      <div style={css.grid2}>
        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Deposit Liquidity</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.formGroup}>
              <label style={css.label}>Amount</label>
              <input style={css.input} type="number" placeholder="e.g. 50000" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} />
            </div>
            <div style={css.buttonRow}>
              <button style={css.btnSecondary} onClick={onFaucet} disabled={faucetState?.status === "loading" || !walletReady}>
                {faucetState?.status === "loading" ? "Minting..." : `Mint ${TOKEN_SYMBOL}`}
              </button>
              <button style={css.btnSecondary} onClick={onApprove} disabled={approveState?.status === "loading" || !walletReady}>
                {approveState?.status === "loading" ? `Approving ${TOKEN_SYMBOL}...` : `Approve ${TOKEN_SYMBOL}`}
              </button>
              <button style={css.btnPrimary} onClick={onDeposit} disabled={depositState?.status === "loading"}>
                {depositState?.status === "loading" ? "Depositing..." : "Encrypt & Deposit"}
              </button>
            </div>
            {faucetState?.message && <div style={css.inlineStatus}>{faucetState.message}</div>}
            {approveState?.message && <div style={css.inlineStatus}>{approveState.message}</div>}
            {depositState?.message && <div style={css.inlineStatus}>{depositState.message}</div>}
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "8px" }}>
              Wallet balance {userState.tokenBalance} {TOKEN_SYMBOL} | allowance {formatAllowanceDisplay(userState.allowance)}.
            </div>
          </div>
        </div>
        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Withdraw Liquidity</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.formGroup}>
              <label style={css.label}>Amount</label>
              <input style={css.input} type="number" placeholder="e.g. 10000" value={form.withdraw} onChange={(event) => setForm({ ...form, withdraw: event.target.value })} />
            </div>
            <button style={css.btnSecondary} onClick={onWithdraw} disabled={withdrawState?.status === "loading"}>
              {withdrawState?.status === "loading" ? "Withdrawing..." : "Encrypt & Withdraw"}
            </button>
            {withdrawState?.message && <div style={css.inlineStatus}>{withdrawState.message}</div>}
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "8px" }}>
              `FHE.select` keeps the withdrawal path quiet. Tokens only move when the withdrawal is actually allowed.
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...css.card, marginTop: "24px" }}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Your LP Position</span>
        </div>
        <div style={css.cardBody}>
          {!walletReady && <div style={css.callout}>Connect a wallet to read and decrypt your LP position.</div>}
          {walletReady && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: T.textSecondary }}>Balance Handle:</span>
                {userState.lpBalanceHandle ? <EncryptedValue value={userState.lpBalanceHandle} /> : <span style={css.muted}>not initialized</span>}
                <button style={css.btnGhost} onClick={onDecryptBalance} disabled={decryptState?.status === "loading"}>
                  {decryptState?.status === "loading" ? "Decrypting..." : "Decrypt Balance"}
                </button>
              </div>
              <div style={{ ...css.callout, marginTop: "12px" }}>
                Public LP token balance: <span style={{ fontFamily: T.mono }}>{userState.lpTokenBalance}</span> {TOKEN_SYMBOL}
              </div>
              {decryptState?.message && <div style={css.inlineStatus}>{decryptState.message}</div>}
              {userState.lpBalancePlaintext && (
                <div style={{ ...css.callout, marginTop: "12px" }}>
                  Decrypted LP principal: <span style={{ fontFamily: T.mono }}>{userState.lpBalancePlaintext}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function OraclePage({ feeds, oracle, account, form, setForm, onSubmit, walletReady, txStates = {} }) {
  const isOracle = walletReady && oracle && account.toLowerCase() === oracle.toLowerCase();
  const oracleState = txStates["oracle-submit"];

  return (
    <div>
      <div style={css.card}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Oracle Feeds</span>
          <span style={{ fontSize: "12px", color: T.textTertiary }}>
            Oracle wallet {shortAddress(oracle)}
          </span>
        </div>
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>Feed</th>
                <th style={css.th}>Source</th>
                <th style={css.th}>Latest Handle</th>
                <th style={css.th}>Initialized</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map((feed) => (
                <tr key={feed.id}>
                  <td style={css.tdText}>{feed.name}</td>
                  <td style={css.tdText}>{feed.source}</td>
                  <td style={css.td}><EncryptedValue value={feed.value} /></td>
                  <td style={css.tdText}>
                    <span style={css.badge(feed.initialized ? "active" : "expired")}>
                      {feed.initialized ? "live" : "empty"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...css.card, marginTop: "24px" }}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Submit Oracle Reading</span>
        </div>
        <div style={css.cardBody}>
          {!walletReady && <div style={css.callout}>Connect a wallet to submit encrypted oracle readings.</div>}
          {walletReady && !isOracle && (
            <div style={css.callout}>
              This wallet is not the configured oracle. Current oracle: <span style={{ fontFamily: T.mono }}>{oracle}</span>
            </div>
          )}
          {isOracle && (
            <>
              <div style={css.formGroup}>
                <label style={css.label}>Feed</label>
                <select style={css.select} value={form.feed} onChange={(event) => setForm({ ...form, feed: event.target.value })}>
                  {FEEDS.map((feed) => (
                    <option key={feed.id} value={feed.id}>{feed.name}</option>
                  ))}
                </select>
              </div>
              <div style={css.formGroup}>
                <label style={css.label}>Reading</label>
                <input style={css.input} type="number" placeholder="e.g. 3200" value={form.reading} onChange={(event) => setForm({ ...form, reading: event.target.value })} />
              </div>
              <button style={css.btnPrimary} onClick={onSubmit} disabled={oracleState?.status === "loading"}>
                {oracleState?.status === "loading" ? "Submitting..." : "Encrypt & Submit Reading"}
              </button>
              {oracleState?.message && <div style={css.inlineStatus}>{oracleState.message}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
