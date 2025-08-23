import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { AIFactoryFeedbackPayload } from '@/lib/types/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper function to determine environment
function getEnvironment(): 'dev' | 'stg' | 'prd' {
  const env = process.env.NODE_ENV;
  if (env === 'production') {
    // Check for specific environment indicators
    if (process.env.BACKEND_BASE_URL?.includes('stg')) return 'stg';
    if (process.env.BACKEND_BASE_URL?.includes('prd')) return 'prd';
    return 'prd'; // Default for production
  }
  return 'dev';
}

// POST /api/feedback -> upstream POST /api/v1/feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();

    const { feedback, queryId, query, answer, comments } = body;

    // Validate required fields
    if (!feedback || !queryId) {
      return errorResponse('Missing required fields: feedback, queryId', 400);
    }

    // Validate that we have either (query and answer) or comments
    if (!(query && answer) && !comments) {
      return errorResponse(
        'Either (query and answer) or comments must be provided',
        400
      );
    }

    // Validate feedback value
    if (!['good', 'bad', 'feedback provided'].includes(feedback)) {
      return errorResponse(
        'Feedback must be either "good", "bad", or "feedback provided"',
        400
      );
    }

    // Transform the payload to match NVIDIA AI Factory schema
    const feedbackPayload: AIFactoryFeedbackPayload = {
      WorkflowName: process.env.FEEDBACK_WORKFLOW_NAME || 'ttysc',
      Feedback: feedback,
      QueryId: queryId,
      Query: query,
      Answer: answer,
      Comments: comments || '',
      AdditionalDetails: [], // Explicitly empty as per requirements
      OwnerDLs: [], // Explicitly empty as per requirements
      UserConsent: true, // Required by API
      Username: session.user.email,
      Environment: getEnvironment(),
    };

    const upstream = await backendRequest<
      { data: unknown },
      AIFactoryFeedbackPayload
    >({
      method: 'POST',
      path: '/api/v1/feedback',
      body: feedbackPayload,
    });

    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// GET /api/feedback - Optional: for fetching feedback history
export async function GET() {
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: '/api/v1/feedback',
    });

    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown, status = 500) {
  let message: string;
  if (typeof e === 'string') message = e;
  else if (e instanceof Error) message = e.message;
  else message = 'Internal server error';

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
