import axios from "axios";

export const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

api.interceptors.request.use((config) => {
  const t = localStorage.getItem("eq_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const AREA_COLORS = {
  A: "#2d8a7c", B: "#6366f1", C: "#f07167", D: "#f59e0b", E: "#8b5cf6", F: "#0ea5e9",
};

export const LEVEL_STYLE = {
  "Needs care first": "bg-[#fff0ee] text-[#c2410c] border-[#f07167]/40",
  Watch: "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/40",
  Steady: "bg-[#e6f4f1] text-[#226b60] border-[#2d8a7c]/30",
  Strength: "bg-[#f3e8ff] text-[#6d28d9] border-[#8b5cf6]/30",
};

export const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export const errMsg = (e) => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg).join(", ");
  return "Something went wrong. Please try again.";
};
