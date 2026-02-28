/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
      // Vercel image optimizer can fail for some proxied external hosts.
      // In that case, serve external image URLs directly in Vercel production.
      unoptimized: process.env.VERCEL === '1',
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        },
        {
          protocol: 'https',
          hostname: 'iqgwvylkgjaqitnqjldp.supabase.co',
        },
        {
          protocol: 'https',
          hostname: 'awfbsiftpwpiczdxlmig.supabase.co',
        },
        {
          protocol: 'https',
          hostname: 'tgrtjlqehgpzdjrlrxxl.supabase.co',
        },
        {
          protocol: 'https',
          hostname: 'duxbe.jiobase.com',
        },
        {
          protocol: 'https',
          hostname: 'api.duxbe.app',
        },
        {
          protocol: 'https',
          hostname: 'api.duxbe.com',
        },
        {
          protocol: 'https',
          hostname: '**.supabase.co',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '54321',
        },
        {
          protocol: 'http',
          hostname: 'localhost',
        },
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  export default nextConfig
  
