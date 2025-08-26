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

    const {
      ConversationId,
      Query,
      Response: ResponseText,
      Error: StreamError,
      AdditionalInfo,
    } = body;

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

    // Validate optional string fields if they exist
    if (StreamError !== undefined && typeof StreamError !== 'string') {
      return apiResponse.error('Error must be a string if provided');
    }

    if (AdditionalInfo !== undefined && typeof AdditionalInfo !== 'string') {
      return apiResponse.error('AdditionalInfo must be a string if provided');
    }

    // Transform the payload to match NVIDIA AI Factory schema
    const userMetricsPayload: UserMetricsPayload = {
      ConversationId: ConversationId as string,
      WorkflowName: process.env.USER_METRICS_WORKFLOW_NAME || 'ttysc',
      SessionId: userEmail, // Using email as session identifier
      IsRecordableConversation: false,
      Query: Query as string,
      Response: ResponseText as string,
      Error: typeof body.Error === 'string' ? body.Error : undefined,
      AdditionalInfo:
        typeof body.AdditionalInfo === 'string'
          ? body.AdditionalInfo
          : undefined,
      Source: 'TTYSC',
      UserBrowser: req.headers.get('user-agent') || 'Unknown',
      Environment: getEnvironment(),
      Username: userEmail,
    };

    console.log('User metrics upstream payload:', userMetricsPayload);
    console.log(JSON.stringify(userMetricsPayload, null, 2));

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
