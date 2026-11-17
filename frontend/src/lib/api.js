import axios from "axios";

// Clean any trailing slashes or accidental '/api' suffix added in environment variables
const rawBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "");

export const api = axios.create({
  baseURL: rawBackendUrl ? `${rawBackendUrl}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("eq_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const AREA_COLORS = {
  A: "#2d8a7c", B: "#6366f1", C: "#f07167", D: "#f59e0b", E: "#8b5cf6", F: "#0ea5e9",
  // FocusEdge segments D1-D10
  D1: "#5a5fc8", D2: "#e07a5f", D3: "#2a9d8f", D4: "#d4a017", D5: "#8b5cf6", D6: "#0ea5e9", D7: "#d9577a", D8: "#3f9f6f", D9: "#7c6fd6", D10: "#c47f3a",
};

export const LEVEL_STYLE = {
  "Needs care first": "bg-[#fff0ee] text-[#c2410c] border-[#f07167]/40",
  Watch: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/40",
  Steady: "bg-eq-soft text-eq-dark border-eq/30",
  Strength: "bg-[#f3e8ff] text-[#6d28d9] border-[#8b5cf6]/30",
};

export const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export const errMsg = (e) => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join(", ");
  return "Something went wrong. Please try again.";
};
