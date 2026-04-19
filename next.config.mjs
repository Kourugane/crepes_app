/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Evita pre-renderizado estático de páginas dinámicas
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig