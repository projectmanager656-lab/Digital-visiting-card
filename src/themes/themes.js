// Single dark "glass" design language shared by every theme — only the
// accent color changes between themes (exactly like the theme pills in the
// reference screenshot: same shell, different accent dot). This keeps every
// theme visually consistent and means adding a 4th theme is just one entry.

export const THEMES = {
  indigo: {
    key: "indigo",
    label: "Slate Indigo",
    tagline: "Tech & professional services",
    accent: "#818cf8",
    accentStrong: "#6366f1",
    gradientFrom: "#6366f1",
    gradientTo: "#8b5cf6",
    swatch: "#6366f1",
  },
  gold: {
    key: "gold",
    label: "Gold Luxe",
    tagline: "Jewellery & boutique",
    accent: "#e5c15c",
    accentStrong: "#d4af37",
    gradientFrom: "#c9992e",
    gradientTo: "#e9cd7a",
    swatch: "#d4af37",
  },
  mineral: {
    key: "mineral",
    label: "Mineral",
    tagline: "Salon, wellness & food",
    accent: "#34d399",
    accentStrong: "#10b981",
    gradientFrom: "#0d9488",
    gradientTo: "#34d399",
    swatch: "#10b981",
  },
};

export const THEME_KEYS = Object.keys(THEMES);
