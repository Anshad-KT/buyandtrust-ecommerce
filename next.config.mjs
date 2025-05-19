// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//         domains: [
//             'hebbkx1anhila5yf.public.blob.vercel-storage.com',
//             'iqwgvylkgjaqitnqjldp.supabase.co',
//             'awfbsiftpwpiczdxlmig.supabase.co',
//             '127.0.0.1:54321',
//             'localhost'
//         ],
//     },
//     eslint: {
//         ignoreDuringBuilds: true,
//     }
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true, // ✅ Enable App Router
    },
    images: {
      domains: [
        'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        'iqgwvylkgjaqitnqjldp.supabase.co',
        'awfbsiftpwpiczdxlmig.supabase.co',
        '127.0.0.1:54321',
        'localhost',
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  export default nextConfig
  