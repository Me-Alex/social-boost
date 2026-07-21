/**
 * Token Verification Endpoint for WebSocket/Auth Validation
 * 
 * This endpoint allows the engine and other services to verify
 * authentication tokens without direct database access.
 * 
 * GET /api/auth/verify?token=xxx
 * POST /api/auth/verify { token: "xxx" }
 * Returns: { valid: boolean, userId?: string, expiresAt?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { getRequestId, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { logAuthEvent, logSecurityEvent } from '@/lib/audit-log';

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  const startTime = performance.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Log the verification attempt (for security monitoring)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    
    if (!token) {
      logSecurityEvent({
        action: 'token_verify_no_token',
        severity: 'low',
        requestId,
        details: { ip: clientIp, userAgent },
        request,
      });
      
      return createErrorResponse(
        'Token parameter is required',
        400,
        { code: 'MISSING_TOKEN' },
        requestId
      );
    }
    
    // Perform token verification
    const result = await verifyAuth(request);
    
    const durationMs = Math.round(performance.now() - startTime);
    
    if (result.authenticated && result.session) {
      // Successful verification
      logAuthEvent({
        action: 'token_verified',
        userId: result.session.userId,
        success: true,
        requestId,
        details: {
          durationMs,
          source: 'api-verify',
          clientIp,
        },
      });
      
      return createSuccessResponse(
        {
          valid: true,
          userId: result.session.userId,
          tokenId: result.session.tokenId,
          createdAt: result.session.createdAt.toISOString(),
          expiresAt: result.session.expiresAt.toISOString(),
        },
        200,
        { durationMs },
        requestId
      );
    } else {
      // Failed verification
      logSecurityEvent({
        action: 'token_verification_failed',
        severity: 'warning',
        requestId,
        details: {
          errorCode: result.errorCode,
          error: result.error,
          clientIp,
          tokenPrefix: token.slice(0, 8) + '...',
          durationMs,
        },
        request,
      });
      
      return createSuccessResponse(
        {
          valid: false,
          error: result.error,
          errorCode: result.errorCode,
        },
        200, // Return 200 with valid=false for easy client handling
        { durationMs },
        requestId
      );
    }
    
  } catch (error) {
    console.error('[AuthVerify] Unexpected error:', error);
    
    logSecurityEvent({
      action: 'token_verify_error',
      severity: 'high',
      requestId,
      details: { error: String(error) },
      request,
    });
    
    return createErrorResponse(
      'Verification service error',
      500,
      { code: 'VERIFY_ERROR' },
      requestId
    );
  }
}

// Also support POST for token verification (more secure - token in body)
export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startTime = performance.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const token = body.token;
    
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!token) {
      return createErrorResponse(
        'Token is required in request body',
        400,
        { code: 'MISSING_TOKEN' },
        requestId
      );
    }
    
    // Create a mock request with the token in authorization header
    // This reuses the existing verifyAuth logic
    const mockRequest = new NextRequest('http://internal/verify', {
      headers: {
        'authorization': `Bearer ${token}`,
        'x-forwarded-for': clientIp,
        'user-agent': request.headers.get('user-agent') || '',
        'x-request-id': requestId,
      }
    });
    
    const result = await verifyAuth(mockRequest);
    const durationMs = Math.round(performance.now() - startTime);
    
    if (result.authenticated && result.session) {
      logAuthEvent({
        action: 'token_verified_post',
        userId: result.session.userId,
        success: true,
        requestId,
        details: { source: 'api-verify-post', durationMs },
      });
      
      return createSuccessResponse(
        {
          valid: true,
          userId: result.session.userId,
          tokenId: result.session.tokenId,
          createdAt: result.session.createdAt.toISOString(),
          expiresAt: result.session.expiresAt.toISOString(),
        },
        200,
        { durationMs },
        requestId
      );
    } else {
      logSecurityEvent({
        action: 'token_verify_post_failed',
        severity: 'warning',
        requestId,
        details: { errorCode: result.errorCode, clientIp, durationMs },
        request,
      });
      
      return createSuccessResponse(
        {
          valid: false,
          error: result.error,
          errorCode: result.errorCode,
        },
        200,
        { durationMs },
        requestId
      );
    }
    
  } catch (error) {
    console.error('[AuthVerify POST] Error:', error);
    return createErrorResponse(
      'Verification error',
      500,
      { code: 'VERIFY_ERROR' },
      requestId
    );
  }
}
