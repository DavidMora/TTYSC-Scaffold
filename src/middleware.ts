import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isFeatureEnabledEdge } from '@/lib/utils/feature-flags-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for auth routes, API routes, and static assets
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if authentication is enabled via feature flag
  try {
    const isAuthEnabled = isFeatureEnabledEdge('enableAuthentication');
    
    if (!isAuthEnabled) {
      // Authentication is disabled, allow all requests to pass through
      return NextResponse.next()
    }
  } catch (error) {
    console.warn('Failed to check feature flag in middleware, defaulting to auth enabled:', error);
    // On error, default to requiring authentication for safety
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    })

    if (!token) {
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', request.url)
      // Use 307 redirect to preserve the original request method and body
      return NextResponse.redirect(url, 307)
    }

    return NextResponse.next()
  } catch {
    // Redirect to signin on any middleware error
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(url, 307)
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\.).*)',
  ],
}
