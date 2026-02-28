/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
      domains: [
        'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        'iqgwvylkgjaqitnqjldp.supabase.co',
        'awfbsiftpwpiczdxlmig.supabase.co',
        'tgrtjlqehgpzdjrlrxxl.supabase.co',
        'duxbe.jiobase.com',
        'api.duxbe.app',
        '127.0.0.1:54321',
        'localhost',
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  export default nextConfig
  