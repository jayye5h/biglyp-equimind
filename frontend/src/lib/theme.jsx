import { createContext, useContext, useEffect, useState } from "react";
import { BRANDS } from "@/lib/brand";

/* All palettes; each brand offers its own subset (EquiMind: blue / mint, MindMellow: lavender / peach / teal, MindEdge: ocean / seafoam / pale gold). */
export const ALL_PALETTES = {
  sky: { label: "Light blue", p: "#3a86c8", grid: "#cfe0f0" },
  mint: { label: "Mint green", p: "#2d8a7c", grid: "#cfe7e2" },
  lavender: { label: "Soft lavender", p: "#8b6fd1", grid: "#e2d9f5" },
  peach: { label: "Warm peach", p: "#e07a5f", grid: "#f7dcd2" },
  teal: { label: "Calm teal", p: "#2a9d8f", grid: "#cdeae6" },
  ocean: { label: "Ocean blue", p: "#2f7bab", grid: "#cfe3ef" },
  seafoam: { label: "Seafoam", p: "#3e9e8a", grid: "#d2ebe4" },
  palegold: { label: "Pale gold", p: "#94712a", grid: "#f1e6c8" },
  indigo: { label: "Soft indigo", p: "#5a5fc8", grid: "#dedff8" },
  coral: { label: "Warm coral", p: "#d66c5c", grid: "#f8ded8" },
  mintleaf: { label: "Mint leaf", p: "#409c7e", grid: "#d6eee4" },
};
const pick = (brand) => Object.fromEntries(BRANDS[brand].palettes.map((k) => [k, ALL_PALETTES[k]]));
// Back-compat export (EquiMind palettes)
export const PALETTES = pick("equimind");

const initialBrand = () => {
  const byPath = Object.values(BRANDS).find((b) => window.location.pathname.startsWith(b.home));
  if (byPath) return byPath.key;
  const b = localStorage.getItem("eq_brand");
  return BRANDS[b] ? b : "equimind";
};
const themeFor = (brand) => {
  const t = localStorage.getItem(`eq_theme_${brand}`) || (brand === "equimind" ? localStorage.getItem("eq_theme") : null);
  return BRANDS[brand].palettes.includes(t) ? t : BRANDS[brand].palettes[0];
};
const b0 = initialBrand();
document.documentElement.dataset.theme = themeFor(b0);

const ThemeCtx = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [brand, setBrandState] = useState(b0);
  const [theme, setTheme] = useState(() => themeFor(b0));
  const setBrand = (b) => {
    if (!BRANDS[b] || b === brand) return;
    setBrandState(b);
    setTheme(themeFor(b));
  };
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(`eq_theme_${brand}`, theme);
    localStorage.setItem("eq_brand", brand);
    document.title = `${BRANDS[brand].name} — ${BRANDS[brand].tagline}`;
  }, [theme, brand]);
  const palettes = pick(brand);
  return (
    <ThemeCtx.Provider value={{ theme, setTheme, palette: ALL_PALETTES[theme], palettes, brand, setBrand, B: BRANDS[brand] }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);
/** Current brand config (name, audience, counsellor wording, paths…). */
export const useBrand = () => useContext(ThemeCtx).B;
