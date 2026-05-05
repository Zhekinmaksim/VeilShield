import { useEffect, useRef, useState } from "react";
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
  APP_TAGLINE,
  EXPORTER_SCENARIO,
} from "./src/config/veilshield.js";

const PUBLIC_PROVIDER = new ethers.JsonRpcProvider(ARB_SEPOLIA_RPC);
const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ENGLISH_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const METRICS_STORAGE_KEY = "veilshield.wave3.metrics";

const T = {
  bg: "#F8F8F4",
  surface: "#FFFFFF",
  surfaceAlt: "#F3F5F1",
  border: "#E1E6E0",
  borderStrong: "#C6D1C8",
  text: "#1B211D",
  textSecondary: "#59655C",
  textTertiary: "#869186",
  accent: "#1B5E3B",
  accentLight: "#E8F5EE",
  accentMuted: "#F1F7F3",
  accentBorder: "#D2E3D8",
  accentDark: "#103A25",
  warning: "#B47A17",
  warningLight: "#FFF7E7",
  danger: "#B64040",
  dangerLight: "#FFF1F1",
  success: "#1B5E3B",
  mono: "'IBM Plex Mono', 'Menlo', monospace",
  sans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  radius: "4px",
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
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
    alignItems: "center",
    padding: "16px 32px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
    gap: "14px 20px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
    justifySelf: "start",
  },
  logoImage: {
    width: "36px",
    height: "36px",
    display: "block",
    flexShrink: 0,
  },
  logoCopy: {
    minWidth: 0,
  },
  logoTextWrap: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    flexWrap: "wrap",
  },
  logoText: {
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  logoMeta: {
    fontSize: "11px",
    color: T.textTertiary,
    fontFamily: T.mono,
  },
  logoTagline: {
    marginTop: "2px",
    fontSize: "11px",
    lineHeight: "1.45",
    color: T.textTertiary,
    fontFamily: T.mono,
    whiteSpace: "nowrap",
  },
  headerControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    justifySelf: "center",
  },
  nav: {
    display: "flex",
    gap: "4px",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
  },
  navItem: (active) => ({
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: active ? 600 : 500,
    color: active ? T.accent : T.textSecondary,
    background: active ? T.accentLight : "transparent",
    borderRadius: T.radius,
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    whiteSpace: "nowrap",
  }),
  walletControls: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    justifySelf: "end",
    minWidth: 0,
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  walletBtn: {
    padding: "8px 16px",
    fontSize: "12px",
    fontFamily: T.mono,
    background: T.text,
    color: "#fff",
    border: "none",
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  walletBtnSecondary: {
    padding: "8px 16px",
    fontSize: "12px",
    fontFamily: T.mono,
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  main: {
    maxWidth: "1160px",
    margin: "0 auto",
    padding: "28px 32px 48px",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  heroPrimary: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "24px",
  },
  heroEyebrow: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: T.accent,
    marginBottom: "10px",
  },
  heroTitle: {
    fontSize: "26px",
    lineHeight: "1.15",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    margin: "0 0 10px",
  },
  heroBody: {
    fontSize: "14px",
    color: T.textSecondary,
    maxWidth: "52ch",
    margin: 0,
  },
  heroMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginTop: "18px",
  },
  heroMetaCard: {
    padding: "12px 14px",
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    background: T.surfaceAlt,
  },
  heroMetaLabel: {
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: T.textTertiary,
    marginBottom: "4px",
  },
  heroMetaValue: {
    fontSize: "12px",
    color: T.textSecondary,
    fontFamily: T.mono,
  },
  heroSecondary: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  heroList: {
    margin: 0,
    paddingLeft: "18px",
    color: T.textSecondary,
    fontSize: "13px",
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
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
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
    fontSize: "23px",
    fontWeight: 700,
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
  statusRail: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginBottom: "16px",
  },
  statusCard: (variant) => {
    const palette = {
      good: { bg: T.accentLight, border: T.accentBorder, color: T.accentDark },
      warn: { bg: T.warningLight, border: "#F0DEB9", color: T.warning },
      bad: { bg: T.dangerLight, border: "#F2CCCC", color: T.danger },
      neutral: { bg: T.surface, border: T.border, color: T.textSecondary },
    };
    const selected = palette[variant] || palette.neutral;
    return {
      border: `1px solid ${selected.border}`,
      background: selected.bg,
      borderRadius: T.radius,
      padding: "12px 14px",
      color: selected.color,
    };
  },
  statusLabel: {
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: "4px",
  },
  statusValue: {
    fontSize: "12px",
    fontFamily: T.mono,
  },
  deploymentBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "12px 16px",
    marginBottom: "16px",
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
    fontWeight: 700,
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
  permitPanel: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "18px 20px",
    marginBottom: "20px",
  },
  permitGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "16px",
    alignItems: "start",
  },
  permitMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "12px",
  },
  permitMetaCard: {
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    background: T.surfaceAlt,
    padding: "12px 14px",
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
    fontWeight: 700,
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
      triggered: { bg: "#F8F1E2", color: T.warning },
      settled: { bg: "#EDF0ED", color: T.textSecondary },
      expired: { bg: "#EDF0ED", color: T.textTertiary },
      cancelled: { bg: T.dangerLight, color: T.danger },
      ready: { bg: T.accentLight, color: T.accent },
    };
    const c = colors[variant] || colors.active;
    return {
      display: "inline-block",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 700,
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
    padding: "9px 12px",
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
    padding: "9px 12px",
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
  dateField: {
    position: "relative",
  },
  dateInput: {
    paddingRight: "48px",
  },
  dateButton: {
    position: "absolute",
    top: "50%",
    right: "12px",
    transform: "translateY(-50%)",
    width: "24px",
    height: "24px",
    border: "none",
    background: "transparent",
    color: T.text,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  datePopover: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "304px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    boxShadow: "0 12px 32px rgba(16, 58, 37, 0.12)",
    zIndex: 20,
    padding: "14px",
  },
  datePopoverHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "12px",
  },
  dateMonthLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: T.text,
  },
  dateNavButton: {
    width: "28px",
    height: "28px",
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    background: T.surfaceAlt,
    color: T.text,
    cursor: "pointer",
    fontFamily: T.mono,
    fontSize: "14px",
  },
  dateWeekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    marginBottom: "6px",
  },
  dateWeekday: {
    textAlign: "center",
    fontSize: "11px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: T.textTertiary,
    padding: "4px 0",
  },
  dateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  dateCell: (selected, muted) => ({
    minHeight: "34px",
    borderRadius: T.radius,
    border: `1px solid ${selected ? T.accentBorder : T.border}`,
    background: selected ? T.accentLight : T.surface,
    color: muted ? T.textTertiary : selected ? T.accentDark : T.text,
    cursor: muted ? "default" : "pointer",
    fontFamily: T.mono,
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  }),
  datePopoverFooter: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },
  dateFooterButton: {
    padding: "8px 10px",
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    background: T.surfaceAlt,
    color: T.textSecondary,
    cursor: "pointer",
    fontFamily: T.mono,
    fontSize: "12px",
  },
  btnPrimary: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 700,
    background: T.accent,
    color: "#fff",
    border: "none",
    borderRadius: T.radius,
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  btnSecondary: {
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.borderStrong}`,
    borderRadius: T.radius,
    cursor: "pointer",
  },
  btnGhost: {
    padding: "6px 12px",
    fontSize: "11px",
    fontWeight: 700,
    background: "transparent",
    color: T.accent,
    border: `1px solid ${T.accentBorder}`,
    borderRadius: T.radius,
    cursor: "pointer",
    fontFamily: T.mono,
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
  disclosureCard: {
    marginTop: "10px",
    padding: "10px 12px",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    background: T.surfaceAlt,
    fontSize: "12px",
    color: T.textSecondary,
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
  link: {
    color: T.accent,
    textDecoration: "none",
    fontWeight: 700,
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
  footer: {
    padding: "24px 32px",
    borderTop: `1px solid ${T.border}`,
    textAlign: "center",
    fontSize: "12px",
    color: T.textTertiary,
    background: T.surface,
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

function formatUtilization(reserved, total) {
  const reservedValue = BigInt(reserved || "0");
  const totalValue = BigInt(total || "0");
  if (totalValue === 0n) {
    return "0%";
  }
  return `${Number((reservedValue * 10000n) / totalValue) / 100}%`;
}

function formatAllowanceDisplay(value) {
  const allowance = BigInt(value || "0");
  if (allowance >= ethers.MaxUint256 / 2n) {
    return "unlimited";
  }
  return allowance.toString();
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatEnglishDateInput(isoValue) {
  if (!isoValue) {
    return "";
  }
  const [year, month, day] = isoValue.split("-");
  if (!year || !month || !day) {
    return "";
  }
  return `${day} / ${month} / ${year}`;
}

function parseEnglishDateInput(inputValue) {
  const digits = (inputValue || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) {
    return "";
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (day < 1 || month < 1 || month > 12 || year < 2024) {
    return "";
  }

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDateTyping(inputValue) {
  const digits = (inputValue || "").replace(/\D/g, "").slice(0, 8);
  if (!digits) {
    return "";
  }
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
}

function getMonthCursor(isoValue) {
  const seed = isoValue ? new Date(`${isoValue}T00:00:00`) : new Date();
  return new Date(seed.getFullYear(), seed.getMonth(), 1);
}

function buildCalendarDays(cursor, selectedIso) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    const iso = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    return {
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      selected: iso === selectedIso,
    };
  });
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
      message: "Private view access is missing or stale. Refresh it and retry.",
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
      message: "Waiting on threshold decryption. The claims queue will refresh automatically.",
    };
  }

  return {
    kind: result.triggered ? "triggered" : "active",
    message: result.triggered
      ? "Ready to finalize into a triggered claim."
      : "Ready to finalize back into active state.",
  };
}

function getDecisionBadge(pendingState) {
  if (!pendingState) {
    return null;
  }
  if (pendingState.kind === "triggered" || pendingState.kind === "active") {
    return { variant: "ready", label: "ready to finalize" };
  }
  return { variant: "pending", label: "waiting on threshold" };
}

function getClaimStage(policy, feedState, pendingState) {
  const decisionBadge = getDecisionBadge(pendingState);
  const oracleLive = Boolean(feedState?.initialized);

  if (policy.status === 0) {
    if (!oracleLive) {
      return {
        badgeVariant: "pending",
        badgeLabel: "pending oracle input",
        timeline: "created → pending oracle input",
      };
    }
    return {
      badgeVariant: "neutral",
      badgeLabel: "oracle submitted",
      timeline: "created → oracle submitted",
    };
  }

  if (policy.status === 1) {
    if (decisionBadge?.variant === "ready") {
      return {
        badgeVariant: "ready",
        badgeLabel: "ready to finalize",
        timeline: "created → oracle submitted → evaluation requested → ready to finalize",
      };
    }
    return {
      badgeVariant: "pending",
      badgeLabel: "waiting on threshold",
      timeline: "created → oracle submitted → evaluation requested → waiting on threshold",
    };
  }

  if (policy.status === 2) {
    return {
      badgeVariant: "ready",
      badgeLabel: "ready to settle",
      timeline: "created → oracle submitted → evaluation requested → finalized → ready to settle",
    };
  }

  if (policy.status === 3) {
    return {
      badgeVariant: "good",
      badgeLabel: "finalized",
      timeline: "created → oracle submitted → evaluation requested → finalized → settled",
    };
  }

  if (policy.status === 4) {
    return {
      badgeVariant: "warn",
      badgeLabel: "expired",
      timeline: "created → expired",
    };
  }

  return {
    badgeVariant: "bad",
    badgeLabel: "cancelled",
    timeline: "created → cancelled",
  };
}

function formatLastChecked(value) {
  if (!value) {
    return "Waiting for the first decision probe.";
  }
  return `Last checked ${new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })}`;
}

function formatPermitExpiry(value) {
  if (!value) {
    return "n/a";
  }
  return `${new Date(Number(value) * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function defaultPermitState() {
  return {
    ready: false,
    valid: false,
    hash: "",
    expiration: 0,
    count: 0,
    error: "Access not issued.",
  };
}

function trackMetric(name) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const snapshot = JSON.parse(window.localStorage.getItem(METRICS_STORAGE_KEY) || "{}");
    snapshot[name] = Number(snapshot[name] || 0) + 1;
    snapshot.lastUpdatedAt = new Date().toISOString();
    window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // metrics are best-effort only
  }

  if (typeof window.va === "function") {
    try {
      window.va("event", { name });
    } catch {
      // analytics dispatch should never break the app
    }
  }
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

function CalendarIcon({ size = 16, color = T.text }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" stroke={color} strokeWidth="1.5" />
      <path d="M5 2v3M11 2v3M2 6h12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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
      generatePermit: false,
    }),
    "CoFHE initialize"
  );
}

function readPermitState() {
  try {
    const activeResult = cofhejs.getPermit();
    const allResult = cofhejs.getAllPermits ? cofhejs.getAllPermits() : { success: false };
    const allPermits = allResult.success ? Object.values(allResult.data || {}) : [];

    if (!activeResult.success) {
      return {
        ...defaultPermitState(),
        count: allPermits.length,
        error: "No active access grant. Request one before decrypting local views.",
      };
    }

    const permit = activeResult.data;
    const validity = permit.isValid ? permit.isValid() : { valid: false, error: "unknown" };
    return {
      ready: true,
      valid: validity.valid,
      hash: permit.getHash ? permit.getHash() : "",
      expiration: permit.expiration || 0,
      count: allPermits.length,
      error: validity.valid ? "" : validity.error || "invalid",
      exported: permit.export ? permit.export() : "",
    };
  } catch (error) {
    return {
      ...defaultPermitState(),
      error: getErrorMessage(error, "Unable to read access state."),
    };
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

const MANUAL_DISCONNECT_KEY = "veilshield.manualDisconnect";

function App() {
  const [workspace, setWorkspace] = useState("claims");
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
  const [permitState, setPermitState] = useState(defaultPermitState());
  const [pendingDecisions, setPendingDecisions] = useState({});
  const [decisionCheckedAt, setDecisionCheckedAt] = useState("");
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
    auditorPolicies: {},
  });
  const [policyForm, setPolicyForm] = useState({
    feed: FEEDS[0].id,
    direction: String(EXPORTER_SCENARIO.activePolicy.direction),
    coverage: "",
    premium: "",
    threshold: "",
    expiry: "",
    beneficiary: "",
  });
  const [policyPreview, setPolicyPreview] = useState(null);
  const [poolForm, setPoolForm] = useState({
    deposit: String(EXPORTER_SCENARIO.liquidityDeposit),
    withdraw: "",
  });
  const [oracleForm, setOracleForm] = useState({
    feed: FEEDS[0].id,
    reading: "",
  });

  function isAutoReconnectBlocked() {
    try {
      return window.localStorage.getItem(MANUAL_DISCONNECT_KEY) === "1";
    } catch {
      return false;
    }
  }

  function setAutoReconnectBlocked(blocked) {
    try {
      if (blocked) {
        window.localStorage.setItem(MANUAL_DISCONNECT_KEY, "1");
      } else {
        window.localStorage.removeItem(MANUAL_DISCONNECT_KEY);
      }
    } catch {}
  }

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

  function setTxStatus(key, status, message = "") {
    setTxStates((current) => ({
      ...current,
      [key]: { status, message },
    }));
  }

  function refreshPermitState() {
    setPermitState(readPermitState());
  }

  function resetWalletSession(options = {}) {
    const { manual = false } = options;

    if (manual) {
      setAutoReconnectBlocked(true);
    }

    try {
      const allResult = cofhejs.getAllPermits ? cofhejs.getAllPermits() : { success: false };
      if (allResult.success) {
        Object.keys(allResult.data || {}).forEach((hash) => {
          try {
            cofhejs.removePermit(hash, true);
          } catch {}
        });
      }
    } catch {}

    setProvider(PUBLIC_PROVIDER);
    setSigner(null);
    setAccount("");
    setChainId(ARB_SEPOLIA_CHAIN_ID);
    setWalletReady(false);
    setCofheReady(false);
    setWalletBusy(false);
    setPermitState(defaultPermitState());
    setTxStates({});
    setPendingDecisions({});
    setDecisionCheckedAt("");
    setUserState({
      tokenBalance: "0",
      allowance: "0",
      lpBalanceHandle: null,
      lpBalancePlaintext: "",
      lpTokenBalance: "0",
      myPolicies: [],
      decryptedPolicies: {},
      auditorPolicies: {},
    });
  }

  function getWriteContract() {
    if (!signer) {
      throw new Error("Connect wallet first.");
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  function getReadContract(currentProvider = provider, currentSigner = signer) {
    const runner = currentSigner || currentProvider;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
  }

  function getWriteToken() {
    if (!signer) {
      throw new Error("Connect wallet first.");
    }
    return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  }

  async function refreshData(
    currentProvider = provider,
    currentAccount = account,
    decryptUser = false,
    currentSigner = signer,
    quiet = false
  ) {
    try {
      const rpcProvider = PUBLIC_PROVIDER;
      const publicContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, rpcProvider);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, rpcProvider);

      const [pool, owner, oracle, asset, policyCountRaw, availableLiquidityTokens] = await Promise.all([
        publicContract.pool(),
        publicContract.owner(),
        publicContract.oracle(),
        publicContract.asset(),
        publicContract.policyCount(),
        publicContract.getAvailableLiquidityTokens(),
      ]);

      const policyCount = Number(policyCountRaw);
      const ids = [];
      for (let id = policyCount - 1; id >= 0 && ids.length < 16; id -= 1) {
        ids.push(BigInt(id));
      }

      const policies = await Promise.all(
        ids.map(async (id) => {
          const [policy, tokenTerms] = await Promise.all([
            publicContract.policies(id),
            publicContract.getPolicyTokenTerms(id),
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
            publicContract.oracleFeedInitialized(feed.bytes32),
            publicContract.oracleValues(feed.bytes32),
          ]);
          return { ...feed, initialized, value };
        })
      );

      const decisionEntries = await Promise.all(
        policies
          .filter((policy) => policy.status === 1)
          .map(async (policy) => {
            try {
              const [ready, triggered] = await publicContract.finalizePolicyEvaluation.staticCall(policy.id);
              return [policy.id, classifyFinalizeResult({ ready, triggered })];
            } catch (error) {
              return [policy.id, { kind: "pending", message: "Threshold probe will retry on the next refresh." }];
            }
          })
      );

      setPendingDecisions(Object.fromEntries(decisionEntries));
      if (decisionEntries.length > 0) {
        setDecisionCheckedAt(new Date().toISOString());
      }

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
          const reader = currentSigner ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, currentSigner) : null;
          const results = await Promise.allSettled([
            reader ? reader.getMyLpBalance() : Promise.reject(new Error("No signer available.")),
            reader ? reader.getMyLpTokenBalance() : Promise.reject(new Error("No signer available.")),
            tokenContract.balanceOf(currentAccount),
            tokenContract.allowance(currentAccount, CONTRACT_ADDRESS),
          ]);

          if (results[0].status === "fulfilled") {
            lpBalanceHandle = results[0].value;
            if (decryptUser && cofheReady && permitState.ready && permitState.valid) {
              lpBalancePlaintext = String(await decryptUint64(lpBalanceHandle));
            }
          }

          if (results[1].status === "fulfilled") {
            lpTokenBalance = formatToken(results[1].value);
          }

          if (results[2].status === "fulfilled") {
            tokenBalance = formatToken(results[2].value);
          }

          if (results[3].status === "fulfilled") {
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
        refreshPermitState();
      } else {
        setUserState({
          tokenBalance: "0",
          allowance: "0",
          lpBalanceHandle: null,
          lpBalancePlaintext: "",
          lpTokenBalance: "0",
          myPolicies: [],
          decryptedPolicies: {},
          auditorPolicies: {},
        });
        setPermitState(defaultPermitState());
      }
    } catch (loadError) {
      if (!quiet) {
        pushToast("State refresh failed", getErrorMessage(loadError, "Failed to load on-chain state."), "error");
      }
    }
  }

  useEffect(() => {
    refreshData(provider, account, walletReady && cofheReady && permitState.valid, signer, true);
  }, [refreshTick]);

  useEffect(() => {
    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        resetWalletSession();
        setRefreshTick((value) => value + 1);
        return;
      }
      if (isAutoReconnectBlocked()) {
        return;
      }
      await connectWallet(true);
    };

    const handleChainChanged = async () => {
      if (isAutoReconnectBlocked()) {
        return;
      }
      await connectWallet(true);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length && !isAutoReconnectBlocked()) {
          connectWallet(true).catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const shouldPoll =
    protocol.policies.some((policy) => policy.status === 1) ||
    Object.values(txStates).some((state) => state.status === "loading" || state.status === "pending");

  useEffect(() => {
    trackMetric(window.location.hostname.includes("veilshield.xyz") ? "live_domain_view" : "demo_view");
  }, []);

  useEffect(() => {
    if (!shouldPoll) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      refreshData(provider, account, false, signer, true);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [shouldPoll, provider, account, signer, walletReady, cofheReady]);

  async function connectWallet(silent = false) {
    if (!window.ethereum) {
      pushToast("Wallet missing", "Install a wallet that exposes window.ethereum.", "error");
      return;
    }

    setWalletBusy(true);
    const toastId = pushToast("Wallet", "Connecting wallet...", "loading", { persist: true });
    let connected = false;

    try {
      if (!silent) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }

      setAutoReconnectBlocked(false);

      await ensureArbitrumSepolia();

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const address = await walletSigner.getAddress();

      if (Number(network.chainId) !== ARB_SEPOLIA_CHAIN_ID) {
        throw new Error("Wallet is not connected to Arbitrum Sepolia.");
      }

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAccount(address);
      setChainId(Number(network.chainId));
      setWalletReady(true);
      setCofheReady(false);
      connected = true;
      trackMetric("wallet_connect");
      refreshPermitState();

      updateToast(toastId, {
        title: "Wallet connected",
        body: "Wallet is ready. Initializing CoFHE in the background...",
        variant: "loading",
      });
      await refreshData(browserProvider, address, false, walletSigner, true);

      await initializeCofhe(browserProvider, walletSigner);
      setCofheReady(true);
      refreshPermitState();

      updateToast(toastId, {
        title: "CoFHE ready",
        body: "Encryption is ready. Request private view access only when you need local decrypt.",
        variant: "success",
      });
      await refreshData(browserProvider, address, false, walletSigner, true);
    } catch (connectError) {
      updateToast(toastId, {
        title: connected ? "CoFHE initialization failed" : "Wallet connection failed",
        body: getErrorMessage(
          connectError,
          connected ? "Wallet connected, but CoFHE did not finish initializing." : "Failed to connect wallet."
        ),
        variant: "error",
      });
    } finally {
      setWalletBusy(false);
    }
  }

  function handleDisconnect() {
    resetWalletSession({ manual: true });
    pushToast(
      "Wallet disconnected",
      "The app session was cleared. Browser wallets keep site authorization until you disconnect them in the wallet extension.",
      "success"
    );
  }

  async function runAction(key, label, action, options = {}) {
    const toastId = pushToast(label, `${label} in progress...`, "loading", { persist: true });
    setTxStatus(key, "loading", `${label} in progress...`);

    try {
      const outcome = await action();
      setTxStatus(key, "success", options.successMessage || `${label} confirmed.`);
      updateToast(toastId, {
        title: label,
        body: options.successMessage || `${label} confirmed on Arbitrum Sepolia.`,
        variant: "success",
      });
      if (options.metric) {
        trackMetric(options.metric);
      }
      refreshPermitState();
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

  async function handlePermitRefresh() {
    await runAction(
      "refresh-permit",
      permitState.ready ? "Refresh access" : "Request access",
      async () => {
        unwrapResult(
          await cofhejs.createPermit({
            name: "VeilShield role access",
            expiration: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
          }),
          "Permit creation"
        );
        refreshPermitState();
      },
      {
        successMessage: "Private view access refreshed. Plaintext stays in the browser.",
        metric: "permit_request",
      }
    );
  }

  async function previewPolicyEncryption() {
    if (!walletReady || !cofheReady) {
      setTxStatus("preview-threshold", "error", "Connect wallet before generating encrypted preview.");
      pushToast("Encryption preview unavailable", "Connect wallet before generating encrypted preview.", "error");
      return;
    }

    try {
      setTxStatus("preview-threshold", "loading", "Generating encrypted threshold preview...");
      const [coverage, premium, threshold] = await Promise.all([
        encryptUint64(policyForm.coverage || "0"),
        encryptUint64(policyForm.premium || "0"),
        encryptUint64(policyForm.threshold || "0"),
      ]);

      setPolicyPreview({ coverage, premium, threshold });
      setTxStatus("preview-threshold", "success", "Threshold preview ready below.");
      trackMetric("preview_threshold");
      pushToast(
        "Encryption preview ready",
        "Threshold is sent encrypted. Coverage and premium previews show the mirrored handles used in the policy view.",
        "success"
      );
    } catch (previewError) {
      const message = getErrorMessage(previewError, "Failed to generate encryption preview.");
      setTxStatus("preview-threshold", "error", message);
      pushToast("Encryption preview failed", message, "error");
    }
  }

  async function handleCreatePolicy() {
    await runAction("create-policy", "Create exporter policy", async () => {
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
        const approveTx = await getWriteToken().approve(CONTRACT_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
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
        beneficiary: account || "",
      });
    }, {
      successMessage: "Cargo delay cover created. Threshold stays encrypted during on-chain evaluation.",
      metric: "create_policy",
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

      const tx = await getWriteContract().depositLiquidity(amount);
      await tx.wait();
      setPoolForm((current) => ({ ...current, deposit: "" }));
    }, {
      metric: "deposit_liquidity",
    });
  }

  async function handleWithdraw() {
    await runAction("withdraw-liquidity", "Withdraw liquidity", async () => {
      const amount = BigInt(poolForm.withdraw || "0");
      if (amount <= 0n) {
        throw new Error("Withdraw amount must be greater than zero.");
      }
      const tx = await getWriteContract().withdrawLiquidity(amount);
      await tx.wait();
      setPoolForm((current) => ({ ...current, withdraw: "" }));
    });
  }

  async function handleTokenApprove() {
    await runAction(
      "approve-token",
      `Approve ${TOKEN_SYMBOL}`,
      async () => {
        const token = getWriteToken();
        const tx = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
        await tx.wait();
      },
      {
        successMessage: `${TOKEN_SYMBOL} allowance updated for the live VeilShield contract.`,
        metric: "approve_token",
      }
    );
  }

  async function handleTokenFaucet() {
    await runAction(
      "token-faucet",
      `${TOKEN_SYMBOL} faucet`,
      async () => {
        const token = getWriteToken();
        const tx = await token.faucet();
        await tx.wait();
      },
      {
        successMessage: `${TOKEN_FAUCET_AMOUNT.toLocaleString()} ${TOKEN_SYMBOL} minted to the connected wallet.`,
        metric: "mint_token",
      }
    );
  }

  async function handleOracleSubmit() {
    await runAction("oracle-submit", "Submit oracle reading", async () => {
      const encrypted = await encryptUint64(oracleForm.reading);
      const tx = await getWriteContract().submitOracleReading(makeFeedBytes32(oracleForm.feed), encrypted);
      await tx.wait();
      setOracleForm((current) => ({ ...current, reading: "" }));
    }, {
      successMessage: "Encrypted exporter feed reading submitted to the live oracle slot.",
      metric: "oracle_submit",
    });
  }

  async function waitForDecisionReady(writeContract, policyId) {
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const [ready] = await writeContract.finalizePolicyEvaluation.staticCall(policyId);
      if (ready) {
        return;
      }
      await sleep(4000);
    }
    throw new Error("Threshold decision did not finish in time. Retry in a few seconds.");
  }

  async function handlePolicyAction(actionName, policyId) {
    const actionKey = `${actionName.toLowerCase().replace(/\s+/g, "-")}-${policyId}`;

    if (actionName === "Finalize evaluation") {
      try {
        const [ready, triggered] = await getWriteContract().finalizePolicyEvaluation.staticCall(policyId);
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
          ? "Evaluation requested. The claims workspace will keep polling until finalize is ready."
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
      if (!permitState.ready || !permitState.valid) {
        throw new Error("Private view access is missing or stale.");
      }
      const handle = await getWriteContract().getMyLpBalance();
      const plaintext = await decryptUint64(handle);
      setUserState((current) => ({
        ...current,
        lpBalanceHandle: handle,
        lpBalancePlaintext: String(plaintext),
      }));
      setTxStatus("decrypt-lp-balance", "success", "LP balance decrypted.");
      trackMetric("decrypt_lp_view");
      updateToast(toastId, {
        title: "LP balance decrypted",
        body: "LP principal unsealed locally in the connected browser session.",
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
    const toastId = pushToast("Decrypt policy", `Decrypting role-scoped policy view for #${policyId}...`, "loading", { persist: true });
    setTxStatus(stateKey, "loading", `Decrypting policy ${policyId}...`);
    try {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect wallet before decrypting.");
      }
      if (!permitState.ready || !permitState.valid) {
        throw new Error("Private view access is missing or stale.");
      }

      const writeContract = getWriteContract();
      const policy = protocol.policies.find((entry) => entry.id === policyId);
      const isInsured = policy && account && policy.insured.toLowerCase() === account.toLowerCase();
      const isBeneficiary = policy && account && policy.beneficiary.toLowerCase() === account.toLowerCase();
      let coverage = "not available";
      let premium = "not available";
      let threshold = "not available";
      let payout = "not available";

      if (isInsured) {
        const terms = await writeContract.getMyPolicyTerms(policyId);
        const decryptedTerms = await Promise.all([
          decryptUint64(terms[0]),
          decryptUint64(terms[1]),
          decryptUint64(terms[2]),
        ]);
        coverage = String(decryptedTerms[0]);
        premium = String(decryptedTerms[1]);
        threshold = String(decryptedTerms[2]);
      }

      if (isInsured || isBeneficiary) {
        try {
          const payoutHandle = await writeContract.getMyPendingPayout(policyId);
          payout = String(await decryptUint64(payoutHandle));
        } catch (payoutError) {
          const classified = classifyDecryptError(payoutError);
          payout = classified.kind === "pending" ? "pending threshold result" : classified.message;
        }
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
            insuredView: Boolean(isInsured),
            beneficiaryView: Boolean(isBeneficiary),
          },
        },
      }));
      setTxStatus(stateKey, "success", `Policy ${policyId} decrypted.`);
      trackMetric("decrypt_policy_view");
      updateToast(toastId, {
        title: "Policy decrypted",
        body: `Role-scoped policy data unsealed locally for policy #${policyId}.`,
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

  async function decryptAuditorPolicy(policyId) {
    const stateKey = `decrypt-auditor-${policyId}`;
    const toastId = pushToast("Decrypt auditor view", `Decrypting auditor policy view for #${policyId}...`, "loading", { persist: true });
    setTxStatus(stateKey, "loading", `Decrypting auditor view for policy ${policyId}...`);
    try {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect wallet before decrypting.");
      }
      if (!permitState.ready || !permitState.valid) {
        throw new Error("Private view access is missing or stale.");
      }
      const [coverageHandle, premiumHandle, thresholdHandle, payoutHandle] =
        await getWriteContract().getAuditorPolicyView(policyId);
      const [coverage, premium, threshold] = await Promise.all([
        decryptUint64(coverageHandle),
        decryptUint64(premiumHandle),
        decryptUint64(thresholdHandle),
      ]);
      let payout = "0";
      try {
        payout = String(await decryptUint64(payoutHandle));
      } catch (payoutError) {
        const classified = classifyDecryptError(payoutError);
        payout = classified.kind === "pending" ? "pending threshold result" : classified.message;
      }

      setUserState((current) => ({
        ...current,
        auditorPolicies: {
          ...current.auditorPolicies,
          [policyId]: {
            coverage: String(coverage),
            premium: String(premium),
            threshold: String(threshold),
            payout,
          },
        },
      }));
      setTxStatus(stateKey, "success", `Auditor view for policy ${policyId} decrypted.`);
      trackMetric("decrypt_auditor_view");
      updateToast(toastId, {
        title: "Auditor view decrypted",
        body: `Owner-scoped encrypted mirrors and payout state loaded for policy #${policyId}.`,
        variant: "success",
      });
    } catch (decryptError) {
      const classified = classifyDecryptError(decryptError);
      setTxStatus(stateKey, classified.kind, classified.message);
      updateToast(toastId, {
        title: classified.kind === "pending" ? "Auditor decrypt pending" : "Auditor decrypt failed",
        body: classified.message,
        variant: classified.kind === "pending" ? "pending" : "error",
      });
    }
  }

  async function seedExporterDemo() {
    await runAction("seed-demo", "Seed exporter demo", async () => {
      if (!walletReady || !cofheReady) {
        throw new Error("Connect the oracle wallet first.");
      }
      const accountNormalized = account.toLowerCase();
      if (
        protocol.oracle &&
        protocol.oracle.toLowerCase() !== accountNormalized &&
        protocol.owner.toLowerCase() !== accountNormalized
      ) {
        throw new Error("Only the oracle / owner wallet can seed the live exporter scenario.");
      }

      const alreadySeeded =
        protocol.policies.some((policy) => policy.status === 0) &&
        protocol.policies.some((policy) => policy.status === 3);
      if (alreadySeeded) {
        throw new Error("Live scenario already contains at least one active and one settled policy.");
      }

      const token = getWriteToken();
      const contract = getWriteContract();
      const requiredCapital =
        BigInt(EXPORTER_SCENARIO.liquidityDeposit) +
        BigInt(EXPORTER_SCENARIO.activePolicy.premium) +
        BigInt(EXPORTER_SCENARIO.settledPolicy.premium);

      if (BigInt(userState.tokenBalance || "0") < requiredCapital) {
        const faucetTx = await token.faucet();
        await faucetTx.wait();
      }

      if (BigInt(userState.allowance || "0") < requiredCapital) {
        const approveTx = await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
      }

      const poolBefore = protocol.pool ? BigInt(protocol.pool.tokenLiquidity) : 0n;
      if (poolBefore === 0n) {
        const depositTx = await contract.depositLiquidity(BigInt(EXPORTER_SCENARIO.liquidityDeposit));
        await depositTx.wait();
      }

      const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14);
      const activePolicyId = Number(await contract.policyCount());
      const activeThreshold = await encryptUint64(EXPORTER_SCENARIO.activePolicy.threshold);
      await (
        await contract.createPolicy(
          BigInt(EXPORTER_SCENARIO.activePolicy.coverage),
          BigInt(EXPORTER_SCENARIO.activePolicy.premium),
          activeThreshold,
          makeFeedBytes32(EXPORTER_SCENARIO.activePolicy.feed),
          EXPORTER_SCENARIO.activePolicy.direction,
          expiry,
          account
        )
      ).wait();

      const settledPolicyId = activePolicyId + 1;
      const settledThreshold = await encryptUint64(EXPORTER_SCENARIO.settledPolicy.threshold);
      await (
        await contract.createPolicy(
          BigInt(EXPORTER_SCENARIO.settledPolicy.coverage),
          BigInt(EXPORTER_SCENARIO.settledPolicy.premium),
          settledThreshold,
          makeFeedBytes32(EXPORTER_SCENARIO.settledPolicy.feed),
          EXPORTER_SCENARIO.settledPolicy.direction,
          expiry,
          account
        )
      ).wait();

      const encryptedReading = await encryptUint64(EXPORTER_SCENARIO.settledPolicy.oracleReading);
      await (
        await contract.submitOracleReading(
          makeFeedBytes32(EXPORTER_SCENARIO.settledPolicy.feed),
          encryptedReading
        )
      ).wait();
      await (await contract.requestPolicyEvaluation(BigInt(settledPolicyId))).wait();
      await waitForDecisionReady(contract, BigInt(settledPolicyId));
      await (await contract.finalizePolicyEvaluation(BigInt(settledPolicyId))).wait();
      await (await contract.settleTriggeredPolicy(BigInt(settledPolicyId))).wait();
    }, {
      successMessage: "Seeded one active cargo policy and one settled claim for the live exporter demo.",
    });
  }

  const isOracle =
    walletReady &&
    protocol.oracle &&
    account &&
    protocol.oracle.toLowerCase() === account.toLowerCase();
  const isAuditor =
    walletReady &&
    protocol.owner &&
    account &&
    protocol.owner.toLowerCase() === account.toLowerCase();

  const workspaces = [
    ["policy", "Policy Holder"],
    ["lp", "Liquidity Provider"],
    ["claims", "Oracle / Claims"],
    ["auditor", "Auditor"],
  ];

  const workspaceMeta = {
    policy: {
      eyebrow: "Policy Holder Workspace",
      title: "Confidential shipment delay cover for exporters",
      body:
        "Create a cargo delay policy, encrypt the threshold in-browser, and only unseal your policy or beneficiary view when you need to inspect it.",
      bullets: [
        "Threshold stays encrypted during trigger evaluation.",
        "Coverage and premium settle in live vUSD on Arbitrum Sepolia.",
        "Policy and beneficiary views decrypt locally for the connected role only.",
      ],
    },
    lp: {
      eyebrow: "Liquidity Provider Workspace",
      title: "Fund exporter risk without opening private positions",
      body:
        "LP capital backs active cargo covers while balances remain available as encrypted handles for the connected provider.",
      bullets: [
        "Mint vUSD, approve once, and deposit into the live pool.",
        "Decrypt your own LP principal locally from the connected wallet.",
        "Watch available versus reserved capacity in real time.",
      ],
    },
    claims: {
      eyebrow: "Oracle / Claims Workspace",
      title: "Submit sealed delay signals and finalize claims",
      body:
        "The claims desk works off encrypted feed updates. Pending policies auto-refresh until the threshold network returns a finalizable result.",
      bullets: [
        "Oracle readings are encrypted before submission.",
        "Pending claims auto-refresh instead of requiring manual reloads.",
        "Seed the live exporter scenario from the oracle wallet when you need a demo-ready state.",
      ],
    },
    auditor: {
      eyebrow: "Auditor Workspace",
      title: "Selective disclosure for portfolio review",
      body:
        "The contract owner can decrypt the encrypted policy mirrors and pending payout state without exposing them to the public chain view.",
      bullets: [
        "Owner-scoped auditor view is enforced in the contract.",
        "Private review stays local to the connected owner wallet.",
        "Claim history remains public while risk terms stay role-scoped.",
      ],
    },
  };

  const currentMeta = workspaceMeta[workspace];
  const statusItems = [
    {
      label: "Workspace",
      value: currentMeta.eyebrow.replace(" Workspace", ""),
      variant: "neutral",
    },
    {
      label: "Wallet",
      value: walletReady ? shortAddress(account) : "disconnected",
      variant: walletReady ? "good" : "bad",
    },
    {
      label: "Network",
      value: chainId === ARB_SEPOLIA_CHAIN_ID ? "Arbitrum Sepolia" : `Chain ${chainId}`,
      variant: chainId === ARB_SEPOLIA_CHAIN_ID ? "good" : "warn",
    },
    {
      label: "CoFHE",
      value: cofheReady ? "initialized" : "offline",
      variant: cofheReady ? "good" : "warn",
    },
    {
      label: "Access",
      value: permitState.ready ? `${permitState.valid ? "active" : permitState.error} ${shortAddress(permitState.hash)}` : "missing",
      variant: permitState.ready && permitState.valid ? "good" : permitState.ready ? "warn" : "bad",
    },
    {
      label: "Oracle Role",
      value: isOracle ? "connected" : "viewer",
      variant: isOracle ? "good" : "neutral",
    },
    {
      label: "Contract",
      value: `live ${shortAddress(CONTRACT_ADDRESS)}`,
      variant: "good",
    },
  ];

  return (
    <div style={css.root}>
      <header style={css.header}>
        <div style={css.logo}>
          <img src="/veilshield-logo.png" alt="VeilShield logo" style={css.logoImage} />
          <div style={css.logoCopy}>
            <div style={css.logoTextWrap}>
              <span style={css.logoText}>VeilShield</span>
              <span style={css.logoMeta}>live</span>
            </div>
            <div style={css.logoTagline}>{APP_TAGLINE}</div>
          </div>
        </div>

        <div style={css.headerControls}>
          <nav style={css.nav}>
            {workspaces.map(([key, label]) => (
              <button key={key} style={css.navItem(workspace === key)} onClick={() => setWorkspace(key)}>
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div style={css.walletControls}>
          {!walletReady && (
            <button style={css.walletBtn} onClick={() => connectWallet(false)} disabled={walletBusy}>
              {walletBusy ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
          {walletReady && (
            <>
              <button
                style={css.walletBtnSecondary}
                onClick={() => refreshData(provider, account, true, signer, false)}
                disabled={walletBusy}
              >
                {shortAddress(account)}
              </button>
              <button style={css.walletBtnSecondary} onClick={handleDisconnect} disabled={walletBusy}>
                Disconnect
              </button>
            </>
          )}
        </div>
      </header>

      <main style={css.main}>
        <div style={css.hero}>
          <div style={css.heroPrimary}>
            <div style={css.heroEyebrow}>{currentMeta.eyebrow}</div>
            <h1 style={css.heroTitle}>{currentMeta.title}</h1>
            <p style={css.heroBody}>{currentMeta.body}</p>
            <div style={css.heroMeta}>
              <div style={css.heroMetaCard}>
                <div style={css.heroMetaLabel}>Live Network</div>
                <div style={css.heroMetaValue}>Arbitrum Sepolia</div>
              </div>
              <div style={css.heroMetaCard}>
                <div style={css.heroMetaLabel}>Live Contract</div>
                <div style={css.heroMetaValue}>{shortAddress(CONTRACT_ADDRESS)}</div>
              </div>
              <div style={css.heroMetaCard}>
                <div style={css.heroMetaLabel}>Cargo Policies</div>
                <div style={css.heroMetaValue}>{protocol.policyCount}</div>
              </div>
              <div style={css.heroMetaCard}>
                <div style={css.heroMetaLabel}>Pool TVL</div>
                <div style={css.heroMetaValue}>{protocol.pool ? formatToken(protocol.pool.tokenLiquidity) : "0"} {TOKEN_SYMBOL}</div>
              </div>
            </div>
          </div>
          <div style={css.heroSecondary}>
            <div style={css.cardTitle}>Why This Workspace Exists</div>
            <ul style={css.heroList}>
              {currentMeta.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div style={css.callout}>
              Built for exporters who need to hedge cargo delay exposure without publishing thresholds, payout intent, or LP positions on transparent rails.
            </div>
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
          <div style={css.buttonRow}>
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

        <StatusRail items={statusItems} />

        <PermitPanel
          permitState={permitState}
          onRefresh={handlePermitRefresh}
          walletReady={walletReady}
          isAuditor={isAuditor}
          isOracle={isOracle}
          txStates={txStates}
        />

        {workspace === "policy" && (
          <PolicyWorkspace
            protocol={protocol}
            account={account}
            walletReady={walletReady}
            userState={userState}
            txStates={txStates}
            pendingDecisions={pendingDecisions}
            onPolicyAction={handlePolicyAction}
            onDecryptPolicy={decryptMyPolicy}
            policyForm={policyForm}
            setPolicyForm={setPolicyForm}
            preview={policyPreview}
            onPreview={previewPolicyEncryption}
            onSubmit={handleCreatePolicy}
            onApprove={handleTokenApprove}
            cofheReady={cofheReady}
            permitState={permitState}
          />
        )}

        {workspace === "lp" && (
          <LiquidityWorkspace
            protocol={protocol}
            walletReady={walletReady}
            userState={userState}
            txStates={txStates}
            form={poolForm}
            setForm={setPoolForm}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onDecryptBalance={decryptMyLpBalance}
            onApprove={handleTokenApprove}
            onFaucet={handleTokenFaucet}
          />
        )}

        {workspace === "claims" && (
          <ClaimsWorkspace
            protocol={protocol}
            walletReady={walletReady}
            account={account}
            form={oracleForm}
            setForm={setOracleForm}
            onSubmit={handleOracleSubmit}
            onPolicyAction={handlePolicyAction}
            txStates={txStates}
            pendingDecisions={pendingDecisions}
            decisionCheckedAt={decisionCheckedAt}
            isOracle={isOracle}
            onSeedDemo={seedExporterDemo}
          />
        )}

        {workspace === "auditor" && (
          <AuditorWorkspace
            protocol={protocol}
            walletReady={walletReady}
            isAuditor={isAuditor}
            onDecryptAuditorPolicy={decryptAuditorPolicy}
            userState={userState}
            txStates={txStates}
          />
        )}
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
        VeilShield — Confidential cargo delay cover for exporters: delay thresholds, claim logic, and role-scoped policy views stay private on-chain. — {shortAddress(CONTRACT_ADDRESS)} on Arbitrum Sepolia
      </footer>
    </div>
  );
}

function StatusRail({ items }) {
  return (
    <div style={css.statusRail}>
      {items.map((item) => (
        <div key={item.label} style={css.statusCard(item.variant)}>
          <div style={css.statusLabel}>{item.label}</div>
          <div style={css.statusValue}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function PermitPanel({ permitState, onRefresh, walletReady, isAuditor, isOracle, txStates = {} }) {
  const permitAction = txStates["refresh-permit"];

  return (
    <div style={css.permitPanel}>
      <div style={{ ...css.cardTitle, marginBottom: "10px" }}>Private View Access</div>
      <div style={css.permitGrid}>
        <div>
          <div style={{ fontSize: "13px", color: T.textSecondary }}>
            The live app uses wallet-signed CoFHE access grants for local unsealing. Public chain readers still see ciphertext handles only. Private views now cover policy holder, beneficiary, LP, and auditor roles.
          </div>
          <div style={css.permitMetaGrid}>
            <div style={css.permitMetaCard}>
              <div style={css.statLabel}>Active Access</div>
              <div style={{ ...css.heroMetaValue, color: permitState.ready ? T.textSecondary : T.warning }}>
                {permitState.ready ? shortAddress(permitState.hash) : "missing"}
              </div>
            </div>
            <div style={css.permitMetaCard}>
              <div style={css.statLabel}>Access Status</div>
              <div style={{ ...css.heroMetaValue, color: permitState.valid ? T.accentDark : T.warning }}>
                {permitState.ready ? (permitState.valid ? "valid" : permitState.error) : "not issued"}
              </div>
            </div>
            <div style={css.permitMetaCard}>
              <div style={css.statLabel}>Expiry</div>
              <div style={css.heroMetaValue}>{formatPermitExpiry(permitState.expiration)}</div>
            </div>
            <div style={css.permitMetaCard}>
              <div style={css.statLabel}>Stored Grants</div>
              <div style={css.heroMetaValue}>{permitState.count}</div>
            </div>
          </div>
        </div>

        <div>
          <div style={css.callout}>
            Roles available with the connected wallet:
            <div style={{ marginTop: "8px", fontFamily: T.mono }}>
              policy holder / beneficiary / LP / {isOracle ? "oracle" : "oracle viewer"} / {isAuditor ? "auditor" : "auditor viewer"}
            </div>
          </div>
          <div style={{ ...css.buttonRow, marginTop: "12px" }}>
            <button style={css.btnPrimary} onClick={onRefresh} disabled={!walletReady || permitAction?.status === "loading"}>
              {permitAction?.status === "loading"
                ? "Signing..."
                : permitState.ready
                  ? "Refresh Access"
                  : "Request Access"}
            </button>
          </div>
          {walletReady && !permitState.ready && (
            <div style={{ ...css.inlineStatus, marginTop: "10px" }}>
              Request access only before a decrypt action. Normal reads and claim polling do not need it.
            </div>
          )}
          {permitAction?.message && <div style={css.inlineStatus}>{permitAction.message}</div>}
        </div>
      </div>
    </div>
  );
}

function PolicyWorkspace(props) {
  const {
    protocol,
    account,
    walletReady,
    userState,
    txStates,
    pendingDecisions,
    onPolicyAction,
    onDecryptPolicy,
    policyForm,
    setPolicyForm,
    preview,
    onPreview,
    onSubmit,
    onApprove,
    cofheReady,
    permitState,
  } = props;
  const myPolicies =
    walletReady && account
      ? protocol.policies.filter(
          (policy) =>
            policy.insured.toLowerCase() === account.toLowerCase() ||
            policy.beneficiary.toLowerCase() === account.toLowerCase()
        )
      : [];
  const pendingMine = myPolicies.filter((policy) => policy.status === 1).length;
  const settledMine = myPolicies.filter((policy) => policy.status === 3).length;
  const triggeredMine = myPolicies.filter((policy) => policy.status === 2).length;

  return (
    <div>
      <div style={{ ...css.grid4, marginBottom: "20px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>My Covers</div>
            <div style={css.statValue}>{myPolicies.length}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Awaiting Claim Decision</div>
            <div style={css.statValue}>{pendingMine}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Triggered / Settled</div>
            <div style={css.statValue}>{triggeredMine + settledMine}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Private View Access</div>
            <div style={css.heroMetaValue}>
              {permitState.ready && permitState.valid ? "decrypt ready" : "request access"}
            </div>
          </div>
        </div>
      </div>

      <div style={css.grid2}>
        <CreatePolicyPage
          form={policyForm}
          setForm={setPolicyForm}
          preview={preview}
          onPreview={onPreview}
          onSubmit={onSubmit}
          walletReady={walletReady}
          cofheReady={cofheReady}
          userState={userState}
          txStates={txStates}
        />

        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Policy Holder Flow</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.callout}>
              1. Buy cover with a public premium and an encrypted threshold.
            </div>
          <div style={{ ...css.callout, marginTop: "12px" }}>
            2. Request private view access only when you need to inspect your own terms or payout state.
          </div>
          <div style={{ ...css.callout, marginTop: "12px" }}>
            3. Track claim status here while the Oracle / Claims desk handles evaluation, finalize readiness, and settlement.
          </div>
          <div style={{ ...css.callout, marginTop: "12px" }}>
            You are buying cover against shipment delay exceeding your private threshold.
          </div>
          <div style={{ ...css.callout, marginTop: "12px" }}>
            Public viewers still see ciphertext handles and status only. Policy holder decrypt stays local to the wallet session.
          </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <PolicyTable
          title="My Covers"
          subtitle="Only policies where this wallet is the insured or beneficiary"
          policies={myPolicies}
          account={account}
          feeds={protocol.feeds}
          onPolicyAction={onPolicyAction}
          onDecryptPolicy={onDecryptPolicy}
          userState={userState}
          walletReady={walletReady}
          txStates={txStates}
          pendingDecisions={pendingDecisions}
          showClaimActions={false}
          emptyMessage={walletReady ? "No covers tied to this wallet yet." : "Connect a wallet to see your covers."}
        />
      </div>
    </div>
  );
}

function EnglishDatePicker({ value, onChange }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [textValue, setTextValue] = useState(formatEnglishDateInput(value));
  const [cursor, setCursor] = useState(getMonthCursor(value));

  useEffect(() => {
    setTextValue(formatEnglishDateInput(value));
    setCursor(getMonthCursor(value));
  }, [value]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const days = buildCalendarDays(cursor, value);

  function commitText(nextText) {
    const isoValue = parseEnglishDateInput(nextText);
    if (isoValue) {
      onChange(isoValue);
      setCursor(getMonthCursor(isoValue));
      return;
    }

    if (!nextText.trim()) {
      onChange("");
    }
  }

  function selectDate(isoValue) {
    onChange(isoValue);
    setTextValue(formatEnglishDateInput(isoValue));
    setCursor(getMonthCursor(isoValue));
    setOpen(false);
  }

  return (
    <div ref={rootRef} style={css.dateField}>
      <input
        style={{ ...css.input, ...css.dateInput }}
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd / mm / yyyy"
        value={textValue}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const nextText = formatDateTyping(event.target.value);
          setTextValue(nextText);
          if (nextText.replace(/\D/g, "").length === 8) {
            commitText(nextText);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => {
            commitText(textValue);
            if (value) {
              setTextValue(formatEnglishDateInput(value));
            }
          }, 0);
        }}
      />
      <button type="button" style={css.dateButton} onClick={() => setOpen((current) => !current)} aria-label="Open English calendar">
        <CalendarIcon />
      </button>

      {open && (
        <div style={css.datePopover}>
          <div style={css.datePopoverHeader}>
            <button type="button" style={css.dateNavButton} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              ←
            </button>
            <div style={css.dateMonthLabel}>
              {ENGLISH_MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </div>
            <button type="button" style={css.dateNavButton} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              →
            </button>
          </div>

          <div style={css.dateWeekdays}>
            {ENGLISH_WEEKDAYS.map((weekday) => (
              <div key={weekday} style={css.dateWeekday}>{weekday}</div>
            ))}
          </div>

          <div style={css.dateGrid}>
            {days.map((day) => (
              <button
                key={day.iso}
                type="button"
                style={css.dateCell(day.selected, !day.inMonth)}
                onClick={() => {
                  if (day.inMonth) {
                    selectDate(day.iso);
                  }
                }}
                disabled={!day.inMonth}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div style={css.datePopoverFooter}>
            <button
              type="button"
              style={css.dateFooterButton}
              onClick={() => {
                const today = new Date();
                selectDate(`${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`);
              }}
            >
              Today
            </button>
            <button
              type="button"
              style={css.dateFooterButton}
              onClick={() => {
                onChange("");
                setTextValue("");
                setOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreatePolicyPage({
  form,
  setForm,
  preview,
  onPreview,
  onSubmit,
  walletReady,
  cofheReady,
  userState,
  txStates = {},
}) {
  const createState = txStates["create-policy"];
  const previewState = txStates["preview-threshold"];
  const hasAllowance = BigInt(userState.allowance || "0") > 0n;
  const previewRef = useRef(null);

  useEffect(() => {
    if (preview) {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [preview]);

  return (
    <div style={css.card}>
      <div style={css.cardHeader}>
        <span style={css.cardTitle}>Create Exporter Policy</span>
      </div>
      <div style={css.cardBody}>
        <div style={css.formGroup}>
          <label style={css.label}>Delay Feed</label>
          <select style={css.select} value={form.feed} onChange={(event) => setForm({ ...form, feed: event.target.value })}>
            {FEEDS.map((feed) => (
              <option key={feed.id} value={feed.id}>{feed.name}</option>
            ))}
          </select>
        </div>

        <div style={css.formGroup}>
          <label style={css.label}>Trigger Direction</label>
          <select style={css.select} value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value })}>
            <option value="0">≥ delay above threshold</option>
            <option value="1">≤ delay below threshold</option>
          </select>
        </div>

        <div style={css.formGroup}>
          <label style={css.label}>Encrypted Delay Threshold (hours)</label>
          <input style={css.input} type="number" placeholder="e.g. 48" value={form.threshold} onChange={(event) => setForm({ ...form, threshold: event.target.value })} />
        </div>

        <div style={css.grid2}>
          <div style={css.formGroup}>
            <label style={css.label}>Coverage Amount</label>
            <input style={css.input} type="number" placeholder="e.g. 1800" value={form.coverage} onChange={(event) => setForm({ ...form, coverage: event.target.value })} />
          </div>
          <div style={css.formGroup}>
            <label style={css.label}>Premium</label>
            <input style={css.input} type="number" placeholder="e.g. 120" value={form.premium} onChange={(event) => setForm({ ...form, premium: event.target.value })} />
          </div>
        </div>

        <div style={css.formGroup}>
          <label style={css.label}>Beneficiary Address</label>
          <input style={css.input} placeholder="0x..." value={form.beneficiary} onChange={(event) => setForm({ ...form, beneficiary: event.target.value })} />
        </div>

        <div style={css.formGroup}>
          <label style={css.label}>Expiry Date</label>
          <EnglishDatePicker value={form.expiry} onChange={(value) => setForm({ ...form, expiry: value })} />
        </div>

        <div style={css.buttonRow}>
          <button
            style={css.btnSecondary}
            onClick={onPreview}
            disabled={createState?.status === "loading" || previewState?.status === "loading"}
          >
            {previewState?.status === "loading" ? "Previewing..." : "Preview Threshold"}
          </button>
          <button style={css.btnPrimary} onClick={onSubmit} disabled={createState?.status === "loading"}>
            {createState?.status === "loading" ? "Submitting..." : "Buy Cover"}
          </button>
        </div>

        {previewState?.message && <div style={css.inlineStatus}>{previewState.message}</div>}
        {createState?.message && <div style={css.inlineStatus}>{createState.message}</div>}

        <div style={{ ...css.callout, marginTop: "12px" }}>
          {!walletReady
            ? "Connect a wallet on Arbitrum Sepolia to enable encryption and submission."
            : !cofheReady
              ? "Wallet connected. CoFHE is still initializing before threshold preview and policy submission."
              : `Premium is funded in live ${TOKEN_SYMBOL}. Current allowance: ${formatAllowanceDisplay(userState.allowance)}. ${hasAllowance ? "Approval already set." : "Buy Cover will request approval automatically if needed."}`}
        </div>

        <div
          ref={previewRef}
          style={{
            ...css.card,
            marginTop: "16px",
            borderColor: preview ? T.accentBorder : T.border,
            background: preview ? T.accentMuted : T.surface,
          }}
        >
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Encryption Preview</span>
          </div>
          <div style={css.cardBody}>
            <div style={{ fontSize: "12px", color: T.textSecondary, marginBottom: "12px" }}>
              Threshold is encrypted client-side and sent to the contract. Coverage and premium previews are shown here too, but the contract derives those encrypted mirrors from the public token amounts.
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
      </div>
    </div>
  );
}

function PolicyTable({
  title,
  subtitle,
  policies,
  account,
  feeds = [],
  onPolicyAction,
  onDecryptPolicy,
  userState,
  walletReady,
  txStates = {},
  pendingDecisions = {},
  showClaimActions = true,
  emptyMessage = "No cargo cover policies on-chain yet.",
}) {
  return (
    <div style={css.card}>
      <div style={css.cardHeader}>
        <span style={css.cardTitle}>{title}</span>
        <span style={css.muted}>{subtitle}</span>
      </div>
      <div style={css.tableWrap}>
        <table style={css.table}>
          <thead>
            <tr>
              <th style={css.th}>ID</th>
              <th style={css.th}>Feed</th>
              <th style={css.th}>Coverage</th>
              <th style={css.th}>Premium</th>
              <th style={css.th}>Coverage Handle</th>
              <th style={css.th}>Premium Handle</th>
              <th style={css.th}>Threshold</th>
              <th style={css.th}>Status</th>
              <th style={css.th}>Claim Stage</th>
              <th style={css.th}>Expiry</th>
              <th style={css.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 && (
              <tr>
                <td colSpan="11" style={css.tdText}>{emptyMessage}</td>
              </tr>
            )}
            {policies.map((policy) => {
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
              const pendingState = pendingDecisions[policy.id];
              const decisionBadge = getDecisionBadge(pendingState);
              const finalizeReady = decisionBadge?.variant === "ready";
              const feedState = feeds.find((feed) => feed.bytes32 === policy.oracleFeedId);
              const claimStage = getClaimStage(policy, feedState, pendingState);

              return (
                <tr key={policy.id}>
                  <td style={css.td}>#{policy.id}</td>
                  <td style={css.tdText}>{decodeFeed(policy.oracleFeedId)}</td>
                  <td style={css.td}>{formatToken(policy.coverageAmount)}</td>
                  <td style={css.td}>{formatToken(policy.premiumAmount)}</td>
                  <td style={css.td}><EncryptedValue value={policy.encCoverage} /></td>
                  <td style={css.td}><EncryptedValue value={policy.encPremium} /></td>
                  <td style={css.td}><EncryptedValue value={policy.encThreshold} /></td>
                  <td style={css.tdText}><span style={css.badge(status)}>{status}</span></td>
                  <td style={css.tdText}>
                    <span style={css.badge(claimStage.badgeVariant)}>{claimStage.badgeLabel}</span>
                    <div style={{ ...css.inlineStatus, marginTop: "8px" }}>{claimStage.timeline}</div>
                  </td>
                  <td style={css.td}>{formatTimestamp(policy.expiryTimestamp)}</td>
                  <td style={css.tdText}>
                    <div style={css.buttonRow}>
                      {showClaimActions && walletReady && policy.status === 0 && (
                        <button
                          style={css.btnGhost}
                          disabled={txStates[requestKey]?.status === "loading"}
                          onClick={() => onPolicyAction("Request evaluation", policy.id)}
                        >
                          Evaluate
                        </button>
                      )}
                      {showClaimActions && walletReady && policy.status === 1 && (
                        <div>
                          <button
                            style={css.btnGhost}
                            disabled={txStates[finalizeKey]?.status === "loading" || !finalizeReady}
                            onClick={() => onPolicyAction("Finalize evaluation", policy.id)}
                          >
                            {finalizeReady ? "Finalize" : "Finalize pending"}
                          </button>
                          {!finalizeReady && (
                            <div style={{ ...css.inlineStatus, marginTop: "8px" }}>No action needed yet.</div>
                          )}
                        </div>
                      )}
                      {showClaimActions && walletReady && policy.status === 2 && (
                        <button
                          style={css.btnGhost}
                          disabled={txStates[settleKey]?.status === "loading"}
                          onClick={() => onPolicyAction("Settle policy", policy.id)}
                        >
                          Settle
                        </button>
                      )}
                      {walletReady && isMine && (
                        <div>
                          <button
                            style={css.btnGhost}
                            disabled={txStates[decryptKey]?.status === "loading"}
                            onClick={() => onDecryptPolicy(policy.id)}
                          >
                            Decrypt My View
                          </button>
                          <div style={{ ...css.inlineStatus, marginTop: "8px" }}>
                            Decrypt your role-scoped policy terms locally.
                          </div>
                        </div>
                      )}
                    </div>
                    {inlineState?.message && <div style={css.inlineStatus}>{inlineState.message}</div>}
                    {pendingState?.message && policy.status === 1 && (
                      <div style={{ ...css.inlineStatus, marginTop: "8px" }}>{pendingState.message}</div>
                    )}
                    {decrypted && (
                      <div style={css.disclosureCard}>
                        {decrypted.insuredView && (
                          <div>
                            insured view: coverage {decrypted.coverage} | premium {decrypted.premium} | threshold {decrypted.threshold}
                          </div>
                        )}
                        {decrypted.beneficiaryView && (
                          <div style={{ marginTop: decrypted.insuredView ? "6px" : 0 }}>
                            beneficiary view: payout {decrypted.payout}
                          </div>
                        )}
                        {!decrypted.insuredView && !decrypted.beneficiaryView && (
                          <div>connected wallet has no decrypt scope for this policy.</div>
                        )}
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
  );
}

function LiquidityWorkspace({
  protocol,
  walletReady,
  userState,
  txStates,
  form,
  setForm,
  onDeposit,
  onWithdraw,
  onDecryptBalance,
  onApprove,
  onFaucet,
}) {
  const approveState = txStates["approve-token"];
  const depositState = txStates["deposit-liquidity"];
  const withdrawState = txStates["withdraw-liquidity"];
  const decryptState = txStates["decrypt-lp-balance"];
  const faucetState = txStates["token-faucet"];
  const pool = protocol.pool;
  const utilization = formatUtilization(pool?.tokenReserved, pool?.tokenLiquidity);

  return (
    <div>
      <div style={{ ...css.grid4, marginBottom: "20px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Pool TVL ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{pool ? formatToken(pool.tokenLiquidity) : "0"}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Reserved Exposure ({TOKEN_SYMBOL})</div>
            <div style={css.statValue}>{pool ? formatToken(pool.tokenReserved) : "0"}</div>
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
            <div style={css.statLabel}>Pool Utilization</div>
            <div style={css.statValue}>{utilization}</div>
          </div>
        </div>
      </div>

      <div style={css.grid2}>
        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Fund Exporter Risk Pool</span>
            <span style={css.muted}>LP-only capital actions</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.formGroup}>
              <label style={css.label}>Deposit Amount</label>
              <input style={css.input} type="number" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} />
            </div>
            <div style={css.buttonRow}>
              <button style={css.btnSecondary} onClick={onFaucet} disabled={faucetState?.status === "loading" || !walletReady}>
                {faucetState?.status === "loading" ? "Minting..." : `Mint ${TOKEN_SYMBOL}`}
              </button>
              <button style={css.btnSecondary} onClick={onApprove} disabled={approveState?.status === "loading" || !walletReady}>
                {approveState?.status === "loading" ? `Approving ${TOKEN_SYMBOL}...` : `Approve ${TOKEN_SYMBOL}`}
              </button>
              <button style={css.btnPrimary} onClick={onDeposit} disabled={depositState?.status === "loading"}>
                {depositState?.status === "loading" ? "Depositing..." : "Deposit"}
              </button>
            </div>
            {faucetState?.message && <div style={css.inlineStatus}>{faucetState.message}</div>}
            {approveState?.message && <div style={css.inlineStatus}>{approveState.message}</div>}
            {depositState?.message && <div style={css.inlineStatus}>{depositState.message}</div>}
            <div style={{ ...css.callout, marginTop: "12px" }}>
              LP capital here is funding exporter delay risk, not just sitting in a generic demo pool.
            </div>
            <div style={{ ...css.callout, marginTop: "12px" }}>
              LP views decrypt locally under private view access. Public pool readers still see totals, utilization, and ciphertext handles only.
            </div>
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "8px" }}>
              Wallet balance {userState.tokenBalance} {TOKEN_SYMBOL} | allowance {formatAllowanceDisplay(userState.allowance)}.
            </div>
          </div>
        </div>

        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Withdraw Position</span>
            <span style={css.muted}>No policy actions in LP workspace</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.formGroup}>
              <label style={css.label}>Withdraw Amount</label>
              <input style={css.input} type="number" value={form.withdraw} onChange={(event) => setForm({ ...form, withdraw: event.target.value })} />
            </div>
            <button style={css.btnSecondary} onClick={onWithdraw} disabled={withdrawState?.status === "loading"}>
              {withdrawState?.status === "loading" ? "Withdrawing..." : "Withdraw"}
            </button>
            {withdrawState?.message && <div style={css.inlineStatus}>{withdrawState.message}</div>}
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "8px" }}>
              `FHE.select` keeps the insufficient-liquidity path quiet. Tokens only move when withdrawal is actually allowed.
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...css.card, marginTop: "20px" }}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Selective Disclosure: LP View</span>
          <span style={css.muted}>Your position only</span>
        </div>
        <div style={css.cardBody}>
          {!walletReady && <div style={css.callout}>Connect a wallet to read and decrypt your LP position.</div>}
          {walletReady && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: T.textSecondary }}>Balance Handle:</span>
                {userState.lpBalanceHandle ? <EncryptedValue value={userState.lpBalanceHandle} /> : <span style={css.muted}>not initialized</span>}
                <button style={css.btnGhost} onClick={onDecryptBalance} disabled={decryptState?.status === "loading"}>
                  {decryptState?.status === "loading" ? "Decrypting..." : "Decrypt LP View"}
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

function ClaimsWorkspace({
  protocol,
  walletReady,
  account,
  form,
  setForm,
  onSubmit,
  onPolicyAction,
  txStates = {},
  pendingDecisions = {},
  decisionCheckedAt,
  isOracle,
  onSeedDemo,
}) {
  const claims = protocol.policies.filter((policy) => [0, 1, 2].includes(policy.status));
  const history = protocol.policies.filter((policy) => [3, 4, 5].includes(policy.status));
  const pendingClaims = claims.filter((policy) => policy.status === 1);
  const readyToFinalize = claims.filter((policy) => {
    const pendingState = pendingDecisions[policy.id];
    return policy.status === 1 && pendingState && ["triggered", "active"].includes(pendingState.kind);
  }).length;
  const seedState = txStates["seed-demo"];

  return (
    <div>
      <div style={css.grid2}>
        <OraclePage
          feeds={protocol.feeds}
          oracle={protocol.oracle}
          account={account}
          form={form}
          setForm={setForm}
          onSubmit={onSubmit}
          walletReady={walletReady}
          cofheReady={cofheReady}
          txStates={txStates}
          isOracle={isOracle}
        />

        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Claims Monitor</span>
          </div>
          <div style={css.cardBody}>
            <div style={css.callout}>
              Pending claim statuses auto-refresh every few seconds. When threshold decryption finishes, rows move to “ready to finalize” without a manual reload.
            </div>
            <div style={{ ...css.grid3, marginTop: "16px" }}>
              <div style={css.permitMetaCard}>
                <div style={css.statLabel}>Active Claims</div>
                <div style={css.heroMetaValue}>{claims.filter((policy) => policy.status === 0).length}</div>
              </div>
              <div style={css.permitMetaCard}>
                <div style={css.statLabel}>Pending Decisions</div>
                <div style={css.heroMetaValue}>{claims.filter((policy) => policy.status === 1).length}</div>
              </div>
              <div style={css.permitMetaCard}>
                <div style={css.statLabel}>Triggered Claims</div>
                <div style={css.heroMetaValue}>{claims.filter((policy) => policy.status === 2).length}</div>
              </div>
              <div style={css.permitMetaCard}>
                <div style={css.statLabel}>Ready To Finalize</div>
                <div style={css.heroMetaValue}>{readyToFinalize}</div>
              </div>
              <div style={css.permitMetaCard}>
                <div style={css.statLabel}>Public History</div>
                <div style={css.heroMetaValue}>{history.length}</div>
              </div>
            </div>
            <div style={{ ...css.callout, marginTop: "16px" }}>
              Oracle / Claims is the only workspace that should submit readings or progress the evaluation queue.
            </div>
            <div style={{ ...css.grid3, marginTop: "12px" }}>
              <div style={css.callout}>
                <strong>Encrypted:</strong> threshold, oracle reading, pending payout
              </div>
              <div style={css.callout}>
                <strong>Public:</strong> premium, coverage, beneficiary, expiry
              </div>
              <div style={css.callout}>
                <strong>Why it matters:</strong> exporters should not reveal operating thresholds or claim posture
              </div>
            </div>
            <div style={{ ...css.inlineStatus, marginTop: "12px" }}>{formatLastChecked(decisionCheckedAt)}</div>
            <div style={{ ...css.callout, marginTop: "12px" }}>
              Claim path: create policy → submit oracle reading → request evaluation → wait on threshold decryption → finalize → settle if triggered.
            </div>
            <div style={{ ...css.callout, marginTop: "12px" }}>
              Canonical demo seed: deposit {EXPORTER_SCENARIO.liquidityDeposit} {TOKEN_SYMBOL} → active threshold {EXPORTER_SCENARIO.activePolicy.threshold}h / coverage {EXPORTER_SCENARIO.activePolicy.coverage} / premium {EXPORTER_SCENARIO.activePolicy.premium} → history threshold {EXPORTER_SCENARIO.settledPolicy.threshold}h / oracle reading {EXPORTER_SCENARIO.settledPolicy.oracleReading}.
            </div>
            {pendingClaims.length > 0 && (
              <div style={{ ...css.callout, marginTop: "12px" }}>
                Pending rows are live testnet claims that are waiting on the threshold network. This is part of the current CoFHE async flow, not a broken state.
              </div>
            )}
            {isOracle && (
              <div style={{ ...css.buttonRow, marginTop: "12px" }}>
                <button style={css.btnGhost} onClick={onSeedDemo} disabled={seedState?.status === "loading"}>
                  {seedState?.status === "loading" ? "Seeding..." : "Seed Exporter Demo"}
                </button>
              </div>
            )}
            {seedState?.message && <div style={css.inlineStatus}>{seedState.message}</div>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Claims Book</span>
            <span style={css.muted}>Exporter delay covers in active claim flow</span>
          </div>
          <div style={css.tableWrap}>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Policy</th>
                  <th style={css.th}>Feed</th>
                  <th style={css.th}>Status</th>
                  <th style={css.th}>Claim Stage</th>
                  <th style={css.th}>Expiry</th>
                  <th style={css.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 && (
                  <tr>
                    <td colSpan="6" style={css.tdText}>No active claim flow right now.</td>
                  </tr>
                )}
                {claims.map((policy) => {
                  const status = STATUS_LABELS[policy.status] || "unknown";
                  const pendingState = pendingDecisions[policy.id];
                  const decisionBadge = getDecisionBadge(pendingState);
                  const feedState = protocol.feeds.find((feed) => feed.bytes32 === policy.oracleFeedId);
                  const claimStage = getClaimStage(policy, feedState, pendingState);
                  const requestKey = `request-evaluation-${policy.id}`;
                  const finalizeKey = `finalize-evaluation-${policy.id}`;
                  const settleKey = `settle-policy-${policy.id}`;
                  const inlineState =
                    txStates[requestKey] ||
                    txStates[finalizeKey] ||
                    txStates[settleKey];
                  const finalizeReady = decisionBadge?.variant === "ready";
                  return (
                    <tr key={policy.id}>
                      <td style={css.td}>#{policy.id}</td>
                      <td style={css.tdText}>{decodeFeed(policy.oracleFeedId)}</td>
                      <td style={css.tdText}><span style={css.badge(status)}>{status}</span></td>
                      <td style={css.tdText}>
                        <span style={css.badge(claimStage.badgeVariant)}>{claimStage.badgeLabel}</span>
                        <div style={{ ...css.inlineStatus, marginTop: "8px" }}>{claimStage.timeline}</div>
                      </td>
                      <td style={css.td}>{formatTimestamp(policy.expiryTimestamp)}</td>
                      <td style={css.tdText}>
                        <div style={css.buttonRow}>
                          {walletReady && policy.status === 0 && (
                            <button style={css.btnGhost} disabled={txStates[requestKey]?.status === "loading"} onClick={() => onPolicyAction("Request evaluation", policy.id)}>
                              Evaluate
                            </button>
                          )}
                          {walletReady && policy.status === 1 && (
                            <div>
                              <button
                                style={css.btnGhost}
                                disabled={txStates[finalizeKey]?.status === "loading" || !finalizeReady}
                                onClick={() => onPolicyAction("Finalize evaluation", policy.id)}
                              >
                                {finalizeReady ? "Finalize" : "Finalize pending"}
                              </button>
                              {!finalizeReady && (
                                <div style={{ ...css.inlineStatus, marginTop: "8px" }}>No action needed yet.</div>
                              )}
                            </div>
                          )}
                          {walletReady && policy.status === 2 && (
                            <button style={css.btnGhost} disabled={txStates[settleKey]?.status === "loading"} onClick={() => onPolicyAction("Settle policy", policy.id)}>
                              Settle
                            </button>
                          )}
                        </div>
                        {inlineState?.message && <div style={css.inlineStatus}>{inlineState.message}</div>}
                        {pendingState?.message && policy.status === 1 && (
                          <div style={{ ...css.inlineStatus, marginTop: "8px" }}>{pendingState.message}</div>
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

      <div style={{ marginTop: "20px" }}>
        <div style={css.card}>
          <div style={css.cardHeader}>
            <span style={css.cardTitle}>Public Claim Trail</span>
            <span style={css.muted}>Closed rows visible without decrypt scope</span>
          </div>
          <div style={css.tableWrap}>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Policy</th>
                  <th style={css.th}>Feed</th>
                  <th style={css.th}>Status</th>
                  <th style={css.th}>Coverage</th>
                  <th style={css.th}>Beneficiary</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" style={css.tdText}>No closed claim rows yet.</td>
                  </tr>
                )}
                {history.map((policy) => (
                  <tr key={policy.id}>
                    <td style={css.td}>#{policy.id}</td>
                    <td style={css.tdText}>{decodeFeed(policy.oracleFeedId)}</td>
                    <td style={css.tdText}>
                      <span style={css.badge(STATUS_LABELS[policy.status] || "active")}>
                        {STATUS_LABELS[policy.status] || "unknown"}
                      </span>
                    </td>
                    <td style={css.td}>{formatToken(policy.coverageAmount)}</td>
                    <td style={css.td}>{shortAddress(policy.beneficiary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function OraclePage({ feeds, oracle, account, form, setForm, onSubmit, walletReady, cofheReady, txStates = {}, isOracle }) {
  const oracleState = txStates["oracle-submit"];

  return (
    <div style={css.card}>
      <div style={css.cardHeader}>
        <span style={css.cardTitle}>Oracle Feed Desk</span>
        <span style={{ fontSize: "12px", color: T.textTertiary }}>
          Oracle wallet {shortAddress(oracle)}
        </span>
      </div>
      <div style={css.cardBody}>
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>Feed</th>
                <th style={css.th}>Source</th>
                <th style={css.th}>Latest Handle</th>
                <th style={css.th}>Status</th>
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

        <div style={{ marginTop: "16px" }}>
          {!walletReady && <div style={css.callout}>Connect a wallet to submit encrypted oracle readings.</div>}
          {walletReady && !cofheReady && (
            <div style={css.callout}>
              Wallet connected. CoFHE is still initializing before encrypted oracle submission becomes available.
            </div>
          )}
          {walletReady && !isOracle && (
            <div style={css.callout}>
              This wallet is not the configured oracle. Current oracle: <span style={{ fontFamily: T.mono }}>{oracle}</span>
            </div>
          )}
          {isOracle && cofheReady && (
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
                <input style={css.input} type="number" placeholder="e.g. 72" value={form.reading} onChange={(event) => setForm({ ...form, reading: event.target.value })} />
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

function AuditorWorkspace({ protocol, walletReady, isAuditor, onDecryptAuditorPolicy, userState, txStates = {} }) {
  const history = protocol.policies.filter((policy) => [3, 4, 5].includes(policy.status));
  const pendingDisclosure = protocol.policies.filter((policy) => [1, 2].includes(policy.status)).length;

  return (
    <div>
      <div style={{ ...css.grid3, marginBottom: "20px" }}>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Policies In Scope</div>
            <div style={css.statValue}>{protocol.policies.length}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Pending Disclosure Rows</div>
            <div style={css.statValue}>{pendingDisclosure}</div>
          </div>
        </div>
        <div style={css.card}>
          <div style={{ padding: "16px 20px" }}>
            <div style={css.statLabel}>Closed Claims</div>
            <div style={css.statValue}>{history.length}</div>
          </div>
        </div>
      </div>

      <div style={css.card}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Auditor Disclosure Desk</span>
          <span style={css.muted}>Owner-only encrypted mirrors and payout state</span>
        </div>
        <div style={css.cardBody}>
          {!walletReady && <div style={css.callout}>Connect the owner wallet to access the auditor disclosure view.</div>}
          {walletReady && !isAuditor && (
            <div style={css.callout}>
              This workspace is locked to the contract owner wallet. Public claim history remains visible below.
            </div>
          )}
          {walletReady && isAuditor && (
            <div style={css.callout}>
              Auditor does not get full protocol transparency. Auditor gets bounded review access only: encrypted policy mirrors plus pending payout.
            </div>
          )}
        </div>
      </div>

      <div style={{ ...css.card, marginTop: "20px" }}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Selective Disclosure Queue</span>
        </div>
        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>Policy</th>
                <th style={css.th}>Feed</th>
                <th style={css.th}>Status</th>
                <th style={css.th}>Coverage</th>
                <th style={css.th}>Beneficiary</th>
                <th style={css.th}>Auditor View</th>
              </tr>
            </thead>
            <tbody>
              {protocol.policies.length === 0 && (
                <tr>
                  <td colSpan="6" style={css.tdText}>No policy history on-chain yet.</td>
                </tr>
              )}
              {protocol.policies.map((policy) => {
                const decryptKey = `decrypt-auditor-${policy.id}`;
                const decrypted = userState.auditorPolicies[policy.id];
                return (
                  <tr key={policy.id}>
                    <td style={css.td}>#{policy.id}</td>
                    <td style={css.tdText}>{decodeFeed(policy.oracleFeedId)}</td>
                    <td style={css.tdText}><span style={css.badge(STATUS_LABELS[policy.status] || "active")}>{STATUS_LABELS[policy.status] || "unknown"}</span></td>
                    <td style={css.td}>{formatToken(policy.coverageAmount)}</td>
                    <td style={css.td}>{shortAddress(policy.beneficiary)}</td>
                    <td style={css.tdText}>
                      {isAuditor ? (
                        <button style={css.btnGhost} disabled={txStates[decryptKey]?.status === "loading"} onClick={() => onDecryptAuditorPolicy(policy.id)}>
                          {txStates[decryptKey]?.status === "loading" ? "Decrypting..." : "Decrypt Auditor View"}
                        </button>
                      ) : (
                        <span style={css.muted}>owner only</span>
                      )}
                      {txStates[decryptKey]?.message && <div style={css.inlineStatus}>{txStates[decryptKey].message}</div>}
                      {decrypted && (
                        <div style={css.disclosureCard}>
                          coverage {decrypted.coverage} | premium {decrypted.premium} | threshold {decrypted.threshold} | payout {decrypted.payout}
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

      <div style={{ ...css.card, marginTop: "20px" }}>
        <div style={css.cardHeader}>
          <span style={css.cardTitle}>Public Claim Trail</span>
        </div>
        <div style={css.cardBody}>
          {history.length === 0 ? (
            <div style={css.callout}>No settled, expired, or cancelled cargo claims yet. Use the seeded exporter scenario to open the history trail.</div>
          ) : (
            <div style={{ fontSize: "13px", color: T.textSecondary }}>
              Claim history is public on purpose. Private terms and payout mirrors stay role-scoped and decrypt only with private view access.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
