


import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {


    return NextResponse.redirect(new URL('/', request.url))
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)
    return NextResponse.redirect(new URL('/auth/auth_error', request.url))
  }
}





