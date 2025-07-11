
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/api/auth-service'

export async function GET(request: NextRequest) {
  try {


    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)
    return NextResponse.redirect(new URL('/auth/auth_error', request.url))
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     const url = new URL(request.url);
//     console.log("eroor url",url)
//     const error = url.searchParams.get("error");
//     console.log("error for link expire",error)
//     const errorCode = url.searchParams.get("error_code");
//     console.log("error for link expire",errorCode)
//     const errorDescription = url.searchParams.get("error_description");
//     console.log("error for link expire",errorDescription)

//     if (error) {
//       const errorUrl = new URL('/auth/auth_error', request.url);
//       console.log("error for link expire",errorUrl)
//       if (error) errorUrl.searchParams.set("error", error);
//       if (errorCode) errorUrl.searchParams.set("error_code", errorCode);
//       if (errorDescription) errorUrl.searchParams.set("error_description", errorDescription);
//       return NextResponse.redirect(errorUrl);
//     }

//     return NextResponse.redirect(new URL('/', request.url));
//   } catch (err) {
//     return NextResponse.redirect(new URL('/auth/auth_error', request.url));
//   }
// }



