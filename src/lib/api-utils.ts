/**
 * API Utilities for SocialBoost
 * 
 * Provides helpers for:
 * - Request authentication
 * - Response standardization  
 * - Request ID generation and tracking
 * - Timing measurement
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, type AuthSession } from './auth-middleware';
import { logSecurityEvent, logApiAccess } from './audit-log';

// ============================================================================
// REQUEST ID TRACKING
// ============================================================================

/**
 * Generate or extract request ID from headers
 */
export function getRequestId(request: NextRequest): string {
  const existingId = request.headers.get('x-request-id');
  if (existingId) return existingId;
  
  // Generate new request ID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `req_${timestamp}_${random}`;
}

/**
 * Add request ID to response headers
 */
export function addRequestIdHeaders(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-ID', requestId);
  return response;
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Authentication result with standardized error responses
 */
export interface AuthResult {
  authenticated: boolean;
  session?: AuthSession;
  errorResponse?: NextResponse;
  requestId: string;
}

/**
 * Verify authentication and return standardized result
 * Use this at the start of protected route handlers
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const requestId = getRequestId(request);
  
  const authResult = await verifyAuth(request);
  
  if (!authResult.authenticated) {
    // Log security event for failed auth
    logSecurityEvent({
      action: 'unauthorized_access',
      severity: 'warning',
      requestId,
      details: {
        errorCode: authResult.errorCode,
        path: new URL(request.url).pathname,
        method: request.method,
      },
      request,
    });
    
    return {
      authenticated: false,
      errorResponse: createErrorResponse(
        authResult.error || 'Authentication required',
        401,
        { code: authResult.errorCode || 'UNAUTHORIZED' },
        requestId
      ),
      requestId,
    };
  }
  
  return {
    authenticated: true,
    session: authResult.session,
    requestId,
  };
}

/**
 * Optional authentication - doesn't reject unauthenticated requests
 * Useful for endpoints that work with or without auth (with different data)
 */
export async function optionalAuth(request: NextRequest): Promise<{
  session?: AuthSession;
  requestId: string;
}> {
  const requestId = getRequestId(request);
  const authResult = await verifyAuth(request);
  
  return {
    session: authResult.authenticated ? authResult.session : undefined,
    requestId,
  };
}

// ============================================================================
// STANDARDIZED RESPONSE HELPERS
// ============================================================================

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  requestId: string;
  timestamp: string;
}

/**
 * Create a successful response
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>,
  requestId: string = ''
): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
    ...(meta && { meta }),
  };

  const response = NextResponse.json(body, { status: statusCode });
  
  if (requestId) {
    addRequestIdHeaders(response, requestId);
  }
  
  return response;
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 400,
  details?: Record<string, unknown>,
  requestId: string = ''
): NextResponse {
  const body: ApiResponse = {
    success: false,
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
    ...(details && { code: details.code, meta: details }),
  };

  const response = NextResponse.json(body, { status: statusCode });
  
  if (requestId) {
    addRequestIdHeaders(response, requestId);
  }
  
  // Add common security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  
  return response;
}

// ============================================================================
// TIMING & LOGGING HELPERS
// ============================================================================

/**
 * Create a timing tracker for API requests
 */
export function createTimer(): { start: number; elapsed: () => number } {
  const start = performance.now();
  return {
    start,
    elapsed: () => Math.round(performance.now() - start),
  };
}

/**
 * Log API access with timing info
 */
export function logAccess(params: {
  request: NextRequest;
  statusCode: number;
  durationMs: number;
  userId?: string;
  requestId: string;
  details?: Record<string, unknown>;
}): void {
  const url = new URL(params.request.url);
  
  logApiAccess({
    method: params.request.method,
    endpoint: `${url.pathname}${url.search}`,
    statusCode: params.statusCode,
    durationMs: params.durationMs,
    userId: params.userId,
    requestId: params.requestId,
    ip: params.request.headers.get('x-forwarded-for') || undefined,
    details: params.details,
  });
}

// ============================================================================
// USER ID EXTRACTION HELPERS
// ============================================================================

/**
 * Extract user ID from authenticated session or query/body
 * Priority: Auth session > Body userId > Query userId
 */
export function getUserId(
  session: AuthSession | undefined,
  body?: Record<string, unknown> | null,
  searchParams?: URLSearchParams
): { userId?: string; source: 'session' | 'body' | 'query' | 'none' } {
  // First priority: authenticated session
  if (session?.userId) {
    return { userId: session.userId, source: 'session' };
  }
  
  // Second: request body
  if (body?.userId && typeof body.userId === 'string') {
    return { userId: body.userId, source: 'body' };
  }
  
  // Third: query parameters
  const queryUserId = searchParams?.get('userId') || searchParams?.get('id');
  if (queryUserId) {
    return { userId: queryUserId, source: 'query' };
  }
  
  return { source: 'none' };
}

/**
 * Validate CUID format for user IDs
 */
export function isValidCuid(id: string): boolean {
  return /^[a-z0-9]{20,30}$/i.test(id);
}
