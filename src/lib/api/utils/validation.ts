import { NextRequest } from 'next/server';
import { apiResponse } from './response';

/**
 * Safely parses JSON from a NextRequest
 * @param req The NextRequest to parse
 * @returns Parsed JSON object or error response
 */
export async function parseJsonBody(
  req: NextRequest
): Promise<Record<string, unknown> | Response> {
  try {
    const result = await req.json();
    if (
      result === null ||
      typeof result !== 'object' ||
      Array.isArray(result)
    ) {
      return apiResponse.error(
        'Invalid request body: expected JSON object',
        400
      );
    }
    return result as Record<string, unknown>;
  } catch {
    return apiResponse.error('Invalid JSON in request body', 400);
  }
}

/**
 * Validates that a value is a non-null object (not array)
 * @param body The value to validate
 * @returns true if valid object, false otherwise
 */
export function isValidObjectBody(
  body: unknown
): body is Record<string, unknown> {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

/**
 * Validates that required fields exist in an object
 * @param body The object to check
 * @param fields Array of required field names
 * @returns Missing fields array or null if all fields present
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): string[] | null {
  const missing = fields.filter((field) => !body[field]);
  return missing.length > 0 ? missing : null;
}

/**
 * Validates request body structure and returns standardized error if invalid
 * @param body The request body to validate
 * @returns Error response if invalid, null if valid
 */
export function validateObjectBody(body: unknown): Response | null {
  if (!isValidObjectBody(body)) {
    return apiResponse.error('Invalid request body: expected JSON object', 400);
  }
  return null;
}

/**
 * Validates required fields and returns standardized error if missing
 * @param body The object containing the fields
 * @param requiredFields Array of required field names
 * @returns Error response if missing fields, null if all present
 */
export function validateRequiredFieldsError(
  body: Record<string, unknown>,
  requiredFields: string[]
): Response | null {
  const missing = validateRequiredFields(body, requiredFields);
  if (missing) {
    return apiResponse.error(
      `Missing required fields: ${missing.join(', ')}`,
      400
    );
  }
  return null;
}

/**
 * Validates that specified fields are all strings
 * @param body The object containing the fields
 * @param fields Array of field names that should be strings
 * @returns Error response if any field is not a string, null if all are strings
 */
export function validateStringFields(
  body: Record<string, unknown>,
  fields: string[]
): Response | null {
  const invalidFields = fields.filter(
    (field) => typeof body[field] !== 'string'
  );

  if (invalidFields.length > 0) {
    return apiResponse.error(
      `Invalid field types: ${invalidFields.join(', ')} must be strings`,
      400
    );
  }

  return null;
}
