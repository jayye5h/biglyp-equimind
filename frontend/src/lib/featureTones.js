const W = (a) => `rgba(255,255,255,${a})`;
const D = (rgb, a) => `rgba(${rgb},${a})`;

export const FEATURE_TONES = {
  powder: { label: "Powder", bg: "#c9def4", fg: "#0f2a4a", muted: D("15,42,74", 0.75), faint: D("15,42,74", 0.5), accent: "#1d5fa8", alert: "#b42318", glass: W(0.45), line: D("15,42,74", 0.15) },
  cornflower: { label: "Cornflower", bg: "#8db8e6", fg: "#0b2240", muted: D("11,34,64", 0.78), faint: D("11,34,64", 0.55), accent: "#0f3f78", alert: "#9f1d13", glass: W(0.3), line: D("11,34,64", 0.18) },
  azure: { label: "Azure", bg: "#2f74b5", fg: "#ffffff", muted: W(0.85), faint: W(0.62), accent: "#d6ebff", alert: "#ffd2ca", glass: W(0.12), line: W(0.22) },
  cobalt: { label: "Cobalt", bg: "#1f4e8c", fg: "#ffffff", muted: W(0.82), faint: W(0.58), accent: "#a9d4ff", alert: "#ffb4a8", glass: W(0.1), line: W(0.18) },
  // MindMellow (lavender family)
  lilac: { label: "Lilac", bg: "#e4daf7", fg: "#2b1d52", muted: D("43,29,82", 0.75), faint: D("43,29,82", 0.5), accent: "#6c4fc4", alert: "#b42318", glass: W(0.45), line: D("43,29,82", 0.15) },
  wisteria: { label: "Wisteria", bg: "#b9a5e8", fg: "#22164a", muted: D("34,22,74", 0.78), faint: D("34,22,74", 0.55), accent: "#4a2f9e", alert: "#9f1d13", glass: W(0.3), line: D("34,22,74", 0.18) },
  violet: { label: "Violet", bg: "#7d62c9", fg: "#ffffff", muted: W(0.86), faint: W(0.64), accent: "#efe7ff", alert: "#ffd2ca", glass: W(0.12), line: W(0.22) },
  plum: { label: "Plum", bg: "#5a3f9c", fg: "#ffffff", muted: W(0.82), faint: W(0.58), accent: "#dccfff", alert: "#ffb4a8", glass: W(0.1), line: W(0.18) },
  dusk: { label: "Dusk", bg: "#2e2257", fg: "#ffffff", muted: W(0.8), faint: W(0.52), accent: "#c7b5ff", alert: "#ffa597", glass: W(0.08), line: W(0.15) },
  // MindEdge (ocean family)
  shoal: { label: "Shoal", bg: "#d4e9f2", fg: "#0e2e44", muted: D("14,46,68", 0.75), faint: D("14,46,68", 0.5), accent: "#1f6c99", alert: "#b42318", glass: W(0.45), line: D("14,46,68", 0.15) },
  lagoon: { label: "Lagoon", bg: "#9fd0cf", fg: "#0c3036", muted: D("12,48,54", 0.78), faint: D("12,48,54", 0.55), accent: "#13606a", alert: "#9f1d13", glass: W(0.3), line: D("12,48,54", 0.18) },
  ocean: { label: "Ocean", bg: "#2f7bab", fg: "#ffffff", muted: W(0.86), faint: W(0.64), accent: "#f6e7b8", alert: "#ffd2ca", glass: W(0.12), line: W(0.22) },
  deepsea: { label: "Deep sea", bg: "#1d5578", fg: "#ffffff", muted: W(0.82), faint: W(0.58), accent: "#f1d98f", alert: "#ffb4a8", glass: W(0.1), line: W(0.18) },
  abyss: { label: "Abyss", bg: "#10304a", fg: "#ffffff", muted: W(0.8), faint: W(0.52), accent: "#9fd8d2", alert: "#ffa597", glass: W(0.08), line: W(0.15) },
  midnight: { label: "Midnight", bg: "#13294b", fg: "#ffffff", muted: W(0.8), faint: W(0.52), accent: "#8ec5ff", alert: "#ffa597", glass: W(0.08), line: W(0.15) },
};

export const TONE_SETS = {
  equimind: ["powder", "cornflower", "azure", "cobalt", "midnight"],
  mindmellow: ["lilac", "wisteria", "violet", "plum", "dusk"],
  mindedge: ["shoal", "lagoon", "ocean", "deepsea", "abyss"],
};
export const brandNow = () => (TONE_SETS[localStorage.getItem("eq_brand")] ? localStorage.getItem("eq_brand") : "equimind");
export const toneStoreKey = (brand = brandNow()) => (brand === "equimind" ? "eq_feature_tone" : `eq_feature_tone_${brand}`);
/** Saved highlight tone for a brand (falls back to the brand's default). */
export const savedTone = (brand = brandNow()) => {
  const k = localStorage.getItem(toneStoreKey(brand));
  return TONE_SETS[brand].includes(k) ? k : TONE_SETS[brand][2];
};

export const toneVars = (key) => {
  const t = FEATURE_TONES[TONE_SETS[brandNow()].includes(key) ? key : savedTone()] || FEATURE_TONES.azure;
  return { "--ft-bg": t.bg, "--ft-fg": t.fg, "--ft-muted": t.muted, "--ft-faint": t.faint, "--ft-accent": t.accent, "--ft-alert": t.alert, "--ft-glass": t.glass, "--ft-line": t.line };
};
