/**
 * Audit Logs API Endpoint for Admin Dashboard
 * 
 * Provides access to audit logs for monitoring and security analysis.
 * Requires authentication and admin privileges.
 * 
 * GET /api/admin/audit-logs - Retrieve audit logs with filtering
 * 
 * Query Parameters:
 * - limit: Number of logs to return (default: 50, max: 500)
 * - offset: Pagination offset (default: 0)
 * - category: Filter by category (auth, data, admin, api, system, security)
 * - severity: Filter by severity (info, warning, error, critical)
 * - userId: Filter by user ID
 * - since: ISO date string for start range
 * - until: ISO date string for end range
 * - action: Filter by action (partial match)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { getAuditLogsFromDb, getAuditStatsFromDb } from '@/lib/audit-log';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Authenticate request (must be logged in)
    const authResult = await requireAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with defaults and limits
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    let offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Enforce limits
    limit = Math.min(Math.max(limit, 1), 500); // Between 1-500
    offset = Math.max(offset, 0); // Non-negative
    
    // Optional filters
    const category = searchParams.get('category') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    
    // Date range filters
    let since: Date | undefined;
    let until: Date | undefined;
    
    const sinceStr = searchParams.get('since');
    const untilStr = searchParams.get('until');
    
    if (sinceStr) {
      since = new Date(sinceStr);
      if (isNaN(since.getTime())) {
        return NextResponse.json(
          { error: 'Invalid "since" date format. Use ISO 8601 format.', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
    }
    
    if (untilStr) {
      until = new Date(untilStr);
      if (isNaN(until.getTime())) {
        return NextResponse.json(
          { error: 'Invalid "until" date format. Use ISO 8601 format.', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
    }
    
    // Validate category if provided
    const validCategories = ['auth', 'data', 'admin', 'api', 'system', 'security'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { 
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`, 
          code: 'INVALID_CATEGORY' 
        },
        { status: 400 }
      );
    }
    
    // Validate severity if provided
    const validSeverities = ['info', 'warning', 'error', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json(
        { 
          error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`, 
          code: 'INVALID_SEVERITY' 
        },
        { status: 400 }
      );
    }
    
    // Determine if stats-only request
    const statsOnly = searchParams.get('stats') === 'true';
    
    const durationMs = Math.round(performance.now() - startTime);
    
    if (statsOnly) {
      // Return statistics only
      const stats = await getAuditStatsFromDb({ since, until });
      
      return NextResponse.json({
        success: true,
        stats,
        meta: {
          durationMs,
          requestedAt: new Date().toISOString(),
          filters: { category, severity, userId, since: since?.toISOString(), until: until?.toISOString() }
        }
      });
    }
    
    // Fetch logs from database
    const result = await getAuditLogsFromDb({
      limit,
      offset,
      category,
      severity,
      userId,
      since,
      until,
      action
    });
    
    // Return response with pagination metadata
    return NextResponse.json({
      success: true,
      logs: result.logs.map(log => ({
        id: log.id,
        severity: log.severity,
        category: log.category,
        action: log.action,
        message: log.message,
        userId: log.userId,
        requestId: log.requestId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent ? log.userAgent.slice(0, 100) + (log.userAgent.length > 100 ? '...' : '') : null,
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        details: log.details,
        createdAt: log.createdAt.toISOString(),
      })),
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + limit < result.total,
      },
      meta: {
        durationMs,
        requestedAt: new Date().toISOString(),
        filters: { category, severity, userId, since: since?.toISOString(), until: until?.toISOString(), action }
      }
    });
    
  } catch (error) {
    console.error('[AuditLogsAPI] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve audit logs', 
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
