import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)

    const errorUrl = new URL('/auth/auth_error', request.url)
    return NextResponse.redirect(errorUrl)
  }
}
