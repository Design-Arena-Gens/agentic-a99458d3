/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*.supabase.co', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
