"use server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
            get: (name) => event.cookies.get(name),
            set: (name, value, options) => event.cookies.set(name, value, { ...options, path: '/' }),
          },
          auth: {
            flowType: 'pkce',
          },
        
    }
  )
}