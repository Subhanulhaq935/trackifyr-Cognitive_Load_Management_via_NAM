import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pg'],
  // Next 15: turbo lives under experimental (top-level `turbopack` is Next 16+).
  experimental: {
    turbo: {
      root: __dirname,
      resolveAlias: {
        '@': path.join(__dirname),
      },
    },
  },
}

export default nextConfig



