export const MODEL = "gemini-3-flash-preview"; // Latest cutting-edge model
export const FALLBACK_MODELS = ["gemini-3-flash-preview", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-flash-latest"];


export const COLORS = [
  "#6C63FF",
  "#00D4AA",
  "#FF6B6B",
  "#FFB347",
  "#4ECDC4",
  "#A78BFA",
  "#F472B6",
  "#34D399",
];

export const INPUT_STYLE = {
  width: "100%",
  padding: "11px 14px",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  color: "#1a1a2e",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box" as const,
  fontFamily: "'Segoe UI',sans-serif",
};

export const ASSET_TYPES = ["Stock", "ETF", "Mutual Fund", "Commodity", "FD", "Crypto"];

export const NAV_ITEMS = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "portfolio", icon: "📋", label: "Portfolio" },
  { id: "analysis", icon: "🤖", label: "AI Analysis" },
  { id: "goals", icon: "🎯", label: "Financial Goals" },
  { id: "tax", icon: "🧾", label: "Tax Optimizer" },
  { id: "news", icon: "📰", label: "News Sentiment" },
  { id: "alerts", icon: "🛎️", label: "Smart Alerts" },
  { id: "add", icon: "＋", label: "Add Investment" },
];

export const VOICE_STATES = {
  idle: { color: "#94a3b8", label: "Ready" },
  recording: { color: "#FF6B6B", label: "🔴 Recording..." },
  thinking: { color: "#6C63FF", label: "⟳ Thinking..." },
  speaking: { color: "#00D4AA", label: "🔊 Speaking..." },
};
