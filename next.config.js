/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimización ACTIVA. Antes estaba `unoptimized: true` "porque las
    // tiendas tienen dominios variables", y el coste era brutal: los
    // originales de producto son de 3000×4000 y hasta 7 MB, y el navegador
    // los descargaba enteros para cada card del grid. Lo que se veía como
    // "imágenes borrosas" era el primer pase del JPEG progresivo / PNG
    // entrelazado durante los segundos que tardaba el resto.
    //
    // `hostname: "**"` (comodín de Next 14) cubre cualquier CDN https, así
    // que la variedad de dominios deja de ser un motivo para no optimizar.
    // Next redimensiona en servidor al tamaño que pide `sizes` y sirve
    // AVIF/WebP: una card de 720px pasa de ~2 MB a ~60 KB, nítida.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    // Pantallas 2× de gran ancho (el catálogo se mira en monitores de 2.5K
    // con DPR alto): el mayor candidato del srcset debe cubrir 100vw ahí.
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920, 2560, 3840],
    imageSizes: [40, 48, 72, 96, 128, 256, 384],
    // Las URLs de producto llevan `?v=` de caché en origen; un día de caché
    // del optimizador evita reprocesar en cada visita.
    minimumCacheTTL: 86400,
  },
};

module.exports = nextConfig;
