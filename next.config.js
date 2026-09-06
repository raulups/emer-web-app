/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // El catálogo agrega imágenes de múltiples tiendas con dominios variables,
    // por lo que se desactiva la optimización remota basada en allowlist de host.
    unoptimized: true,
  },
};

module.exports = nextConfig;
