import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { isFeatureEnabledEdge } from '@/lib/utils/feature-flags-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicAuthRoutes = [
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/callback',
    '/api/auth/providers',
    '/api/auth/csrf',
    '/api/auth/session',
    '/api/auth/error',
    '/api/auth/config',
    '/api/auth/provider-sign-out',
    '/api/auth/force-logout',
    '/api/auth/restart-session',
  ]

  // Allow NextAuth routes, auth pages, and static assets
  const isPublicRoute = 
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    publicAuthRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/api/auth/'); // Allow all NextAuth routes

  if (isPublicRoute) {
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

  // Check authentication for all other routes (including protected API routes)
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      // Let next-auth handle cookie name detection automatically
    })

    if (!token) {
      // For API routes, return 401 instead of redirecting
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // For page routes, redirect to signin
      const url = new URL('/auth/signin', request.url)
      url.searchParams.set('callbackUrl', request.url)
      // Use 307 redirect to preserve the original request method and body
      return NextResponse.redirect(url, 307)
    }

    return NextResponse.next()
  } catch {
    // For API routes, return error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }

    // Redirect to signin on any middleware error for page routes
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(url, 307)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
