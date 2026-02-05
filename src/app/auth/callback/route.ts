import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simply redirect to home page - no need for dynamic URL handling
    return NextResponse.redirect('/')
  } catch (err) {
    console.error("🔥 Error in /auth/callback:", err)
    return NextResponse.redirect('/auth/auth_error')
  }
}





