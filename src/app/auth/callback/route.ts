// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// export async function GET(request: Request) {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_KEY!
//   );

//   // Just get the current session
//   const { data, error } = await supabase.auth.getSession();
//   console.log("Session data:", data);
//   console.log("Session error:", error);

//   // Redirect to home after getting session
//   const redirectUrl = new URL("/", request.url);
//   return NextResponse.redirect(redirectUrl);
// }
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // const supabase = createRouteHandlerClient({ cookies })
    // const {
    //   data: { session },
    //   error,
    // } = await supabase.auth.getSession()

    // if (error) {
    //   console.error("Session fetch error:", error)
    // }

    // if (!session) {
    //   console.warn("⚠️ No session returned.")
    //   return NextResponse.redirect(new URL('/auth/auth_error', request.url))
    // }

    // console.log("✅ Session:", session)

    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)
    return NextResponse.redirect(new URL('/auth/auth_error', request.url))
  }
}

