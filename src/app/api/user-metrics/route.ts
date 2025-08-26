import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { UserMetricsPayload } from '@/lib/services/user-metrics.service';
import { getEnvironment } from '@/lib/api/utils/environment';
import { apiResponse } from '@/lib/api/utils/response';
import { requireAuthentication } from '@/lib/api/utils/auth';
import {
  parseJsonBody,
  validateRequiredFieldsError,
  validateStringFields,
} from '@/lib/api/utils/validation';

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

    // Parse and validate JSON body
    const body = await parseJsonBody(req);
    if (body instanceof globalThis.Response) {
      return body; // Return error response
    }

    const { ConversationId, Query, Response: ResponseText } = body;

    // Validate required fields
    const fieldsError = validateRequiredFieldsError(body, [
      'ConversationId',
      'Query',
      'Response',
    ]);
    if (fieldsError) {
      return fieldsError;
    }

    // Ensure fields are strings
    const typeError = validateStringFields(body, [
      'ConversationId',
      'Query',
      'Response',
    ]);
    if (typeError) {
      return typeError;
    }

    // Transform the payload to match NVIDIA AI Factory schema
    const userMetricsPayload: UserMetricsPayload = {
      ConversationId: ConversationId as string,
      WorkflowName: process.env.USER_METRICS_WORKFLOW_NAME || 'ttysc',
      SessionId: userEmail, // Using email as session identifier
      IsRecordableConversation: false,
      Query: Query as string,
      Response: ResponseText as string,
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
