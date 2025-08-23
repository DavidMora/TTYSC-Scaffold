import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { AIFactoryFeedbackPayload } from '@/lib/types/feedback';
import { getEnvironment } from '@/lib/api/utils/environment';
import { apiResponse } from '@/lib/api/utils/response';
import { requireAuthentication } from '@/lib/api/utils/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/feedback -> upstream POST /api/v1/feedback
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuthentication();
    if ('errorResponse' in authResult) {
      return authResult.errorResponse;
    }

    const { userEmail } = authResult;

    const body = await req.json();

    const { feedback, queryId, query, answer, comments } = body;

    // Validate required fields
    if (!feedback || !queryId) {
      return apiResponse.error(
        'Missing required fields: feedback, queryId',
        400
      );
    }

    // Validate that we have either (query and answer) or comments
    if (!(query && answer) && !comments) {
      return apiResponse.error(
        'Either (query and answer) or comments must be provided',
        400
      );
    }

    // Validate feedback value
    if (!['good', 'bad', 'feedback provided'].includes(feedback)) {
      return apiResponse.error(
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
      Username: userEmail,
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

    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}

// GET /api/feedback - Optional: for fetching feedback history
export async function GET() {
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: '/api/v1/feedback',
    });

    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
