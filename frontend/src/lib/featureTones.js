const W = (a) => `rgba(255,255,255,${a})`;
const D = (rgb, a) => `rgba(${rgb},${a})`;

export const FEATURE_TONES = {
  powder: { label: "Powder", bg: "#c9def4", fg: "#0f2a4a", muted: D("15,42,74", 0.75), faint: D("15,42,74", 0.5), accent: "#1d5fa8", alert: "#b42318", glass: W(0.45), line: D("15,42,74", 0.15) },
  cornflower: { label: "Cornflower", bg: "#8db8e6", fg: "#0b2240", muted: D("11,34,64", 0.78), faint: D("11,34,64", 0.55), accent: "#0f3f78", alert: "#9f1d13", glass: W(0.3), line: D("11,34,64", 0.18) },
  azure: { label: "Azure", bg: "#2f74b5", fg: "#ffffff", muted: W(0.85), faint: W(0.62), accent: "#d6ebff", alert: "#ffd2ca", glass: W(0.12), line: W(0.22) },
  cobalt: { label: "Cobalt", bg: "#1f4e8c", fg: "#ffffff", muted: W(0.82), faint: W(0.58), accent: "#a9d4ff", alert: "#ffb4a8", glass: W(0.1), line: W(0.18) },
  midnight: { label: "Midnight", bg: "#13294b", fg: "#ffffff", muted: W(0.8), faint: W(0.52), accent: "#8ec5ff", alert: "#ffa597", glass: W(0.08), line: W(0.15) },
};

export const toneVars = (key) => {
  const t = FEATURE_TONES[key] || FEATURE_TONES.azure;
  return { "--ft-bg": t.bg, "--ft-fg": t.fg, "--ft-muted": t.muted, "--ft-faint": t.faint, "--ft-accent": t.accent, "--ft-alert": t.alert, "--ft-glass": t.glass, "--ft-line": t.line };
};
