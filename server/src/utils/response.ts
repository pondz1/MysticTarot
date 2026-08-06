import { Response } from 'express';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  [key: string]: any;
}

/**
 * Send a standardized success response.
 * Preserves top-level keys for backward compatibility with existing API contracts.
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  statusCode: number = 200,
  extraProps?: Record<string, any>
): Response {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return res.status(statusCode).json({
      success: true,
      ...data,
      ...(extraProps || {}),
    });
  }

  return res.status(statusCode).json({
    success: true,
    data,
    ...(extraProps || {}),
  });
}

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  code?: string,
  extraProps?: Record<string, any>
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(code ? { code } : {}),
    ...(extraProps || {}),
  });
}
