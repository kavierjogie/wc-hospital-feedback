/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['jspdf', 'jspdf-autotable'],
  },
}

module.exports = nextConfig
