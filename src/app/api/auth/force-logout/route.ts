import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * Force logout endpoint that completely clears server-side session
 * and sets aggressive cookie clearing headers
 */
export async function POST(): Promise<NextResponse> {
  
  try {
    console.log('[Force Logout] Starting server-side session clearing');
    
    // Get current session to verify it exists
    const session = await getServerSession(authOptions);
    console.log('[Force Logout] Current session exists:', !!session);
    
    // Create response that clears all authentication cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Server session cleared',
      sessionWasActive: !!session
    });
    
    // Define all possible NextAuth cookie names
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token', 
      'next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      'next-auth.state',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'nextauth.session-token',
      'nextauth.csrf-token',
      'authjs.session-token',
      'authjs.csrf-token',
    ];
    
    // Clear all cookies with various configurations
    cookieNames.forEach(cookieName => {
      // Clear with standard attributes
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Clear with different path variations
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/api',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/auth',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Clear with strict sameSite
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Clear without httpOnly (for client-side accessible cookies)
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[Force Logout] Server-side clearing completed');
    return response;
    
  } catch (error) {
    console.error('[Force Logout] Error during server-side clearing:', error);
    
    // Even on error, try to clear cookies
    const response = NextResponse.json({ 
      success: false, 
      message: 'Error during server session clearing',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
    // Still clear cookies on error
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];
    
    cookieNames.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
  }
}