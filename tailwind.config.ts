import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Sistema de diseño "Marketplace Moda" (handoff de Claude Design).
 *
 * Todos los tokens se declaran como CSS variables en app/globals.css y aquí
 * solo se mapean a utilidades, para que exista una única fuente de verdad.
 * Los nombres semánticos que ya usaba el markup (`ink`, `paper`, `line`,
 * `subtle`, `muted-text`) se conservan como alias para no tocar cada
 * className:
 *
 *   ink -> --fg      paper -> --bg      line -> --border
 *   subtle -> --muted-bg                 muted-text -> --text-3
 */
const config: Config = {
  // `lib` y `hooks` también: las clases de columnas del grid
  // (GRID_DENSITY_CLASSES) viven en lib/types/grid.ts. Sin escanearlo,
  // Tailwind no las genera y el grid se queda en una columna.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Con `<alpha-value>` Tailwind puede componer `bg-ink/60`,
        // `text-paper/85`, etc. Con `var(--fg)` a secas descartaba esas
        // clases sin avisar (ver globals.css).
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        fg: "rgb(var(--fg-rgb) / <alpha-value>)",
        "fg-inverse": "rgb(var(--bg-rgb) / <alpha-value>)",
        "fg-hover": "var(--fg-hover)",
        "fg-hover-2": "var(--fg-hover-2)",
        ink: "rgb(var(--fg-rgb) / <alpha-value>)",
        paper: "rgb(var(--bg-rgb) / <alpha-value>)",
        line: "rgb(var(--border-rgb) / <alpha-value>)",
        subtle: "rgb(var(--muted-bg-rgb) / <alpha-value>)",
        /** Párrafos de cuerpo (AA sobre --bg). */
        "text-2": "var(--text-2)",
        /** Texto secundario: footer, estados (AA sobre --bg). */
        "text-3": "var(--text-3)",
        "muted-text": "var(--text-3)",
        /** Solo decorativo: números de índice, separadores. NO llega a AA. */
        "text-4": "var(--text-4)",
        "text-5": "var(--text-5)",
        muted: "var(--text-4)",
      },
      fontFamily: {
        brand: ["var(--font-brand)", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Helvetica", "Arial", "sans-serif"],
        sans: ["var(--font-ui)", "Helvetica", "Arial", "sans-serif"],
        ui: ["var(--font-ui)", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Mínimo del sistema: 14px. No existe microtipografía por debajo.
        ui: ["var(--ui-size-base)", { lineHeight: "var(--ui-line-height)" }],
        // Escala fluida del handoff (clamp). Los line-heights < 1 son a
        // propósito: apilado denso de titulares Archivo 900.
        "fluid-body": ["clamp(14px, 3.4vw, 14.5px)", { lineHeight: "1.7" }],
        "fluid-name": ["clamp(14px, 3.4vw, 15px)", { lineHeight: "1.3" }],
        "fluid-title": ["clamp(24px, 6vw, 40px)", { lineHeight: "0.95" }],
        "fluid-result": ["clamp(24px, 6vw, 46px)", { lineHeight: "1" }],
        "fluid-section": ["clamp(26px, 7vw, 44px)", { lineHeight: "1.02" }],
        "fluid-cta": ["clamp(30px, 8vw, 96px)", { lineHeight: "0.92" }],
        "fluid-view": ["clamp(34px, 9vw, 104px)", { lineHeight: "0.9" }],
        "fluid-search": ["clamp(34px, 10vw, 104px)", { lineHeight: "1.05" }],
        "fluid-brand": ["clamp(42px, 11vw, 150px)", { lineHeight: "0.84" }],
        "fluid-logo": ["clamp(44px, 13vw, 146px)", { lineHeight: "0.82" }],
        "fluid-hero": ["clamp(44px, 12vw, 184px)", { lineHeight: "0.86" }],
        "fluid-index": ["clamp(52px, 13vw, 128px)", { lineHeight: "0.82" }],
        "fluid-bento-narrow": ["clamp(38px, 8vw, 74px)", { lineHeight: "1" }],
        "fluid-bento-wide": ["clamp(48px, 11vw, 172px)", { lineHeight: "1" }],
        "fluid-bento-full": ["clamp(52px, 15vw, 230px)", { lineHeight: "0.8" }],
      },
      letterSpacing: {
        display: "var(--tracking-display)",
        "display-xl": "var(--tracking-display-xl)",
        heading: "var(--tracking-heading)",
        name: "var(--tracking-name)",
        mono: "var(--tracking-mono)",
        "mono-wide": "var(--tracking-mono-wide)",
        "mono-widest": "var(--tracking-mono-widest)",
        // Alias del sistema anterior.
        ui: "var(--tracking-mono)",
      },
      borderRadius: {
        none: "var(--radius)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
        zoom: "var(--dur-zoom)",
      },
      transitionTimingFunction: {
        zara: "var(--ease)",
        "zara-out": "var(--ease-out)",
        editorial: "var(--ease)",
      },
      spacing: {
        header: "var(--header-h)",
        page: "var(--px-page)",
        section: "var(--py-section)",
        bar: "var(--py-bar)",
      },
      minHeight: {
        hit: "44px",
        cta: "48px",
        "cta-lg": "56px",
      },
      minWidth: {
        hit: "44px",
      },
      boxShadow: {
        none: "none",
      },
      backgroundImage: {
        "overlay-card": "linear-gradient(180deg, rgba(10,10,10,.12), rgba(10,10,10,.35))",
        "overlay-hero":
          "linear-gradient(180deg, rgba(10,10,10,.35) 0%, rgba(10,10,10,.05) 45%, rgba(10,10,10,.6) 100%)",
        "overlay-banner": "linear-gradient(180deg, rgba(10,10,10,.35), rgba(10,10,10,.75))",
      },
    },
  },
  plugins: [
    // `touch:` = dispositivos sin puntero. Lo que el handoff revela solo
    // al hover (botón "Ver colección", compra directa) se muestra siempre
    // ahí, porque no hay hover que lo descubra.
    plugin(({ addVariant }) => {
      addVariant("touch", "@media (hover: none)");
    }),
  ],
};

export default config;
