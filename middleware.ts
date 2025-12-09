import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Inactivity timeout in milliseconds (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply middleware to dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check last activity timestamp from cookie
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity) {
      const timeSinceLastActivity = now - parseInt(lastActivity)
      
      // If user has been inactive for more than the timeout, they'll need to re-authenticate
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        const response = NextResponse.redirect(new URL('/handler/sign-in', request.url))
        response.cookies.delete('last_activity')
        return response
      }
    }

    // Update last activity timestamp
    const response = NextResponse.next()
    response.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  }

  return NextResponse.next()
}

// Configure which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
