import type { Config } from "tailwindcss";

/**
 * Sistema de diseño (lenguaje ZARA.com adaptado a catálogo).
 *
 * Todos los tokens se declaran como CSS variables en app/globals.css y aquí
 * solo se mapean a utilidades de Tailwind, para que exista una única fuente
 * de verdad. Los nombres semánticos ya usados en la app (`ink`, `paper`,
 * `line`, `subtle`) se mantienen como alias de los tokens nuevos para no
 * romper el markup existente:
 *
 *   ink     -> --fg          paper  -> --bg
 *   line    -> --border      subtle -> --skeleton
 *   muted   -> --muted       accent -> --accent (solo rebajas)
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        "fg-inverse": "var(--fg-inverse)",
        ink: "var(--fg)",
        paper: "var(--bg)",
        line: "var(--border)",
        subtle: "var(--skeleton)",
        /** Gris decorativo del sistema (#999): divisores, marcas de slider. */
        muted: "var(--muted)",
        /**
         * Gris para TEXTO secundario. Más oscuro que --muted a propósito:
         * #999 sobre blanco da 2.85:1 y no llega a AA, y este mismo sistema
         * exige contraste AA (ver README, "Desviaciones deliberadas").
         */
        "muted-text": "var(--muted-text)",
        /** Único acento cromático: precios de oferta y chip REBAJA. */
        accent: "var(--accent)",
        sale: "var(--accent)",
      },
      fontFamily: {
        // Serif editorial: solo wordmark y titulares puntuales.
        display: ["var(--font-display)", "Bodoni Moda", "serif"],
        // Todo el chrome de interfaz.
        sans: ["var(--font-ui)", "Helvetica Neue", "Arial", "sans-serif"],
        ui: ["var(--font-ui)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      fontSize: {
        // Mínimo del sistema: 14px. No existe microtipografía por debajo.
        ui: ["var(--ui-size-base)", { lineHeight: "var(--ui-line-height)" }],
      },
      letterSpacing: {
        ui: "var(--ui-tracking)",
        display: "var(--display-tracking)",
        // Alias legacy: el markup existente usaba tracking-widest2 para todo
        // el chrome; ahora apunta al tracking de UI del sistema (0.06em).
        widest2: "var(--ui-tracking)",
      },
      borderRadius: {
        none: "var(--radius)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        zara: "var(--ease)",
        "zara-out": "var(--ease-out)",
        // Alias legacy del markup existente -> curva del sistema.
        editorial: "var(--ease)",
      },
      spacing: {
        header: "var(--header-h)",
      },
      boxShadow: {
        // El sistema no usa sombras en ningún sitio.
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
