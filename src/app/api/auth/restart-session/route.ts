import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  try {
    console.log('[Auth] Restarting session');

    // Get current session to verify user is authenticated
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No active session to restart' },
        { status: 401 }
      );
    }

    console.log(
      '[Auth] Session restarted successfully for user:',
      session.user?.email
    );

    // Return success response - the client will handle clearing local storage
    return NextResponse.json({
      success: true,
      message: 'Session restarted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Auth] Error during session restart:', error);
    return NextResponse.json(
      { error: 'Failed to restart session' },
      { status: 500 }
    );
  }
}
