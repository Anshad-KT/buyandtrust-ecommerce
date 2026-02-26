/** @type {import('next').NextConfig} */
const nextConfig = {

    images: {
      domains: [
        'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        'iqgwvylkgjaqitnqjldp.supabase.co',
        'awfbsiftpwpiczdxlmig.supabase.co',
        'tgrtjlqehgpzdjrlrxxl.supabase.co',
        'api.duxbe.com',
        '127.0.0.1:54321',
        'localhost',
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  export default nextConfig
  