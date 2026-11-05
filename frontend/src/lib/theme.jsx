import { createContext, useContext, useEffect, useState } from "react";

export const PALETTES = {
  sky: { label: "Light blue", p: "#3a86c8", grid: "#cfe0f0" },
  mint: { label: "Mint green", p: "#2d8a7c", grid: "#cfe7e2" },
};

const initial = PALETTES[localStorage.getItem("eq_theme")] ? localStorage.getItem("eq_theme") : "sky";
document.documentElement.dataset.theme = initial;

const ThemeCtx = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(initial);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("eq_theme", theme);
  }, [theme]);
  return <ThemeCtx.Provider value={{ theme, setTheme, palette: PALETTES[theme] }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
