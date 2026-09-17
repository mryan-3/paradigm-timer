export type VisualLook = "paper-ink" | "riso" | "screen" | "blueprint";

export interface Palette {
  name: string;
  paper: string;
  ink: string;
  accent: string;
  secondary: string;
  wash: string;
}

export const PALETTES: Record<VisualLook, Palette> = {
  "paper-ink": {
    name: "Ink on Paper",
    paper: "#faf5ec",
    ink: "#1c1917",
    accent: "#c25736", // Terracotta
    secondary: "#d9822b", // Warm Ochre
    wash: "rgba(217, 130, 43, 0.12)",
  },
  riso: {
    name: "Risograph",
    paper: "#f7f1e5",
    ink: "#1e1e24",
    accent: "#e04e38", // Fluorescent coral
    secondary: "#3a7d74", // Pine / sage green
    wash: "rgba(224, 78, 56, 0.14)",
  },
  screen: {
    name: "Screen Print",
    paper: "#f3ede2",
    ink: "#18181b",
    accent: "#bf4e30", // Poster red
    secondary: "#d49b35", // Marigold
    wash: "rgba(191, 78, 48, 0.1)",
  },
  blueprint: {
    name: "Blueprint",
    paper: "#f5f0e6",
    ink: "#23272e",
    accent: "#4b6584", // Steel blue
    secondary: "#778ca3",
    wash: "rgba(75, 101, 132, 0.12)",
  },
};
