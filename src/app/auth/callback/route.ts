import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Build absolute URL using request origin
    const url = new URL('/', request.url)

    return NextResponse.redirect(url)
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)

    const errorUrl = new URL('/auth/auth_error', request.url)
    return NextResponse.redirect(errorUrl)
  }
}
