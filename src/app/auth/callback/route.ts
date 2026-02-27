import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function resolveSafeNextPath(request: NextRequest): string {
  const nextPath = request.nextUrl.searchParams.get('next') || '/'
  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/'
  }
  return nextPath
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(resolveSafeNextPath(request), request.url)
    return NextResponse.redirect(url)
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)

    const errorUrl = new URL('/auth/auth_error', request.url)
    return NextResponse.redirect(errorUrl)
  }
}
