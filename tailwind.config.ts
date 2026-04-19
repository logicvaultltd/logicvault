import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "vault-bg": "var(--background)",
        "vault-card": "var(--card-background)",
        "vault-border": "var(--card-border)",
        "vault-muted": "var(--surface-inset-background)",
        "vault-blue": "var(--vault-blue)",
        "vault-electric": "var(--vault-electric)",
        "vault-cyan": "var(--vault-cyan)",
        "vault-lime": "var(--vault-lime)",
        "vault-violet": "var(--vault-violet)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        utility: "var(--vault-panel-shadow)",
      },
    },
  },
};

export default config;
