import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { UserMetricsPayload } from '@/lib/services/user-metrics.service';
import { getEnvironment } from '@/lib/api/utils/environment';
import { apiResponse } from '@/lib/api/utils/response';
import { requireAuthentication } from '@/lib/api/utils/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/user-metrics -> upstream POST /api/v1/usermetric
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuthentication();
    if ('errorResponse' in authResult) {
      return authResult.errorResponse;
    }

    const { userEmail } = authResult;

    let body;
    try {
      body = await req.json();
    } catch {
      return apiResponse.error('Invalid JSON in request body', 400);
    }

    // Validate request body structure
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return apiResponse.error(
        'Invalid request body: expected JSON object',
        400
      );
    }

    const { ConversationId, Query, Response } = body;

    // Validate required fields
    if (!ConversationId || !Query || !Response) {
      return apiResponse.error(
        'Missing required fields: ConversationId, Query, Response',
        400
      );
    }

    // Ensure fields are strings
    if (
      typeof ConversationId !== 'string' ||
      typeof Query !== 'string' ||
      typeof Response !== 'string'
    ) {
      return apiResponse.error(
        'Invalid field types: ConversationId, Query, and Response must be strings',
        400
      );
    }

    // Transform the payload to match NVIDIA AI Factory schema
    const userMetricsPayload: UserMetricsPayload = {
      ConversationId,
      WorkflowName: process.env.USER_METRICS_WORKFLOW_NAME || 'ttysc',
      SessionId: userEmail, // Using email as session identifier
      IsRecordableConversation: false,
      Query,
      Response,
      Source: 'TTYSC',
      UserBrowser: req.headers.get('user-agent') || 'Unknown',
      Environment: getEnvironment(),
      Username: userEmail,
    };

    const upstream = await backendRequest<
      { success: boolean; message?: string },
      UserMetricsPayload
    >({
      method: 'POST',
      path: '/api/v1/usermetric',
      body: userMetricsPayload,
    });

    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
