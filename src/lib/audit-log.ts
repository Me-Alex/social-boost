/**
 * Audit Logging Utility for SocialBoost
 * 
 * Provides structured logging for security-sensitive events.
 * Tracks: auth events, data modifications, admin actions, errors
 * 
 * Supports dual-mode logging:
 * - In-memory buffer (fast, for recent log retrieval)
 * - Database persistence (durable, for historical analysis)
 */

import { db } from '@/lib/db';

type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
type AuditCategory = 'auth' | 'data' | 'admin' | 'api' | 'system' | 'security';

export interface AuditLogEntry {
  timestamp: string;
  severity: AuditSeverity;
  category: AuditCategory;
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  details: Record<string, unknown>;
  metadata?: {
    durationMs?: number;
    statusCode?: number;
    endpoint?: string;
    method?: string;
  };
}

// In-memory log buffer (for fast retrieval of recent logs)
const auditLogBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

// Database persistence settings
const PERSIST_TO_DB = true; // Enable database persistence
const DB_LOG_BATCH_SIZE = 10; // Batch size for async writes
const pendingDbWrites: Array<{
  severity: string;
  category: string;
  action: string;
  message: string | null;
  userId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  details: string | null;
}> = [];

/**
 * Process batch of pending DB writes (called periodically)
 */
async function processPendingDbWrites(): Promise<void> {
  if (pendingDbWrites.length === 0) return;
  
  const batch = pendingDbWrites.splice(0, DB_LOG_BATCH_SIZE);
  
  try {
    await db.auditLog.createMany({
      data: batch,
      skipDuplicates: true,
    });
  } catch (error) {
    // If DB write fails, put entries back (up to a limit)
    console.error('[AuditLog] Failed to persist logs to database:', error);
    if (pendingDbWrites.length < MAX_BUFFER_SIZE) {
      pendingDbWrites.unshift(...batch);
    }
  }
}

// Process pending writes every 5 seconds
if (typeof globalThis !== 'undefined') {
  setInterval(processPendingDbWrites, 5000);
}

/**
 * Log an audit event
 */
export function auditLog(params: {
  severity: AuditSeverity;
  category: AuditCategory;
  action: string;
  userId?: string;
  requestId?: string;
  details: Record<string, unknown>;
  metadata?: AuditLogEntry['metadata'];
  request?: Request;
}): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    severity: params.severity,
    category: params.category,
    action: params.action,
    userId: params.userId,
    requestId: params.requestId,
    details: params.details,
    metadata: params.metadata,
  };

  // Extract IP and user agent from request if available
  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  
  if (params.request) {
    ipAddress = params.request.headers.get('x-forwarded-for') || 
               params.request.headers.get('x-real-ip') || 
               'unknown';
    userAgent = params.request.headers.get('user-agent')?.slice(0, 200);
    entry.ipAddress = ipAddress;
    entry.userAgent = userAgent;
  }

  // Add to in-memory buffer
  auditLogBuffer.push(entry);

  // Trim buffer if needed
  if (auditLogBuffer.length > MAX_BUFFER_SIZE) {
    auditLogBuffer.splice(0, auditLogBuffer.length - MAX_BUFFER_SIZE);
  }

  // Queue for database persistence (async - non-blocking)
  if (PERSIST_TO_DB) {
    // Extract path and method from metadata or request
    const url = params.request ? new URL(params.request.url) : null;
    
    pendingDbWrites.push({
      severity: params.severity,
      category: params.category,
      action: params.action,
      message: typeof params.details === 'string' 
        ? params.details 
        : JSON.stringify(params.details).slice(0, 500),
      userId: params.userId || null,
      requestId: params.requestId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      method: params.metadata?.method || params.request?.method || null,
      path: params.metadata?.endpoint || url?.pathname || null,
      statusCode: params.metadata?.statusCode || null,
      details: Object.keys(params.details).length > 0 
        ? JSON.stringify(params.details).slice(0, 1000) 
        : null,
    });
  }

  // Console output with color coding for development
  const severityColors: Record<AuditSeverity, string> = {
    info: '\x1b[36m',    // cyan
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    critical: '\x1b[41m', // red background
  };
  const reset = '\x1b[0m';
  
  console.log(
    `${severityColors[params.severity]}[AUDIT]${reset} ` +
    `[${params.category.toUpperCase()}] ` +
    `${params.action} ` +
    `(user: ${params.userId || 'anonymous'}) ` +
    JSON.stringify(params.details).slice(0, 200)
  );
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON AUDIT EVENTS
// ============================================================================

/**
 * Log authentication events
 */
export function logAuthEvent(params: {
  action: 'login' | 'logout' | 'register' | 'token_refresh' | 'session_expired' | 'login_failed' | 'account_locked';
  userId?: string;
  success: boolean;
  requestId?: string;
  details?: Record<string, unknown>;
  request?: Request;
}): void {
  auditLog({
    severity: params.success ? 'info' : 'warning',
    category: 'auth',
    action: `auth.${params.action}`,
    userId: params.userId,
    requestId: params.requestId,
    details: {
      success: params.success,
      ...params.details,
    },
    request: params.request,
  });
}

/**
 * Log data modification events
 */
export function logDataEvent(params: {
  action: 'create' | 'update' | 'delete' | 'bulk_create';
  entity: 'campaign' | 'task' | 'user' | 'session';
  entityId?: string;
  userId: string;
  success: boolean;
  requestId?: string;
  details?: Record<string, unknown>;
  request?: Request;
}): void {
  auditLog({
    severity: params.success ? 'info' : 'error',
    category: 'data',
    action: `${params.entity}.${params.action}`,
    userId: params.userId,
    requestId: params.requestId,
    details: {
      entity: params.entity,
      entityId: params.entityId,
      ...params.details,
    },
    request: params.request,
  });
}

/**
 * Log security-related events
 */
export function logSecurityEvent(params: {
  action: 'rate_limit_exceeded' | 'suspicious_activity' | 'unauthorized_access' | 'invalid_token' | 'permission_denied' | 'csrf_detected';
  userId?: string;
  severity: 'warning' | 'error' | 'critical';
  requestId?: string;
  details: Record<string, unknown>;
  request?: Request;
}): void {
  auditLog({
    severity: params.severity,
    category: 'security',
    action: `security.${params.action}`,
    userId: params.userId,
    requestId: params.requestId,
    details: params.details,
    request: params.request,
  });
}

/**
 * Log API access events (for debugging and monitoring)
 */
export function logApiAccess(params: {
  method: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  requestId?: string;
  ip?: string;
  details?: Record<string, unknown>;
}): void {
  const severity: AuditSeverity = 
    params.statusCode >= 500 ? 'error' :
    params.statusCode >= 400 ? 'warning' : 'info';

  auditLog({
    severity,
    category: 'api',
    action: 'api.access',
    userId: params.userId,
    requestId: params.requestId,
    details: {
      method: params.method,
      endpoint: params.endpoint,
      statusCode: params.statusCode,
      durationMs: params.durationMs,
      ...params.details,
    },
    metadata: {
      method: params.method,
      endpoint: params.endpoint,
      statusCode: params.statusCode,
      durationMs: params.durationMs,
    },
  });
}

// ============================================================================
// LOG RETRIEVAL FUNCTIONS (for admin dashboard)
// ============================================================================

/**
 * Get recent audit logs
 */
export function getRecentLogs(options: {
  limit?: number;
  category?: AuditCategory;
  severity?: AuditSeverity;
  userId?: string;
  since?: Date;
} = {}): AuditLogEntry[] {
  let logs = [...auditLogBuffer];

  // Apply filters
  if (options.category) {
    logs = logs.filter(l => l.category === options.category);
  }
  if (options.severity) {
    logs = logs.filter(l => l.severity === options.severity);
  }
  if (options.userId) {
    logs = logs.filter(l => l.userId === options.userId);
  }
  if (options.since) {
    logs = logs.filter(l => new Date(l.timestamp) >= options.since!);
  }

  // Sort by timestamp descending and limit
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const limit = options.limit || 100;
  return logs.slice(0, limit);
}

/**
 * Get audit statistics
 */
export function getAuditStats(): {
  totalLogs: number;
  bySeverity: Record<AuditSeverity, number>;
  byCategory: Record<AuditCategory, number>;
  recentErrors: number; // Errors in last hour
} {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const stats = {
    totalLogs: auditLogBuffer.length,
    bySeverity: {} as Record<AuditSeverity, number>,
    byCategory: {} as Record<AuditCategory, number>,
    recentErrors: 0,
  };

  // Initialize counters
  const severities: AuditSeverity[] = ['info', 'warning', 'error', 'critical'];
  const categories: AuditCategory[] = ['auth', 'data', 'admin', 'api', 'system', 'security'];
  
  for (const s of severities) stats.bySeverity[s] = 0;
  for (const c of categories) stats.byCategory[c] = 0;

  // Count entries
  for (const entry of auditLogBuffer) {
    stats.bySeverity[entry.severity]++;
    stats.byCategory[entry.category]++;
    
    if ((entry.severity === 'error' || entry.severity === 'critical') &&
        new Date(entry.timestamp) >= oneHourAgo) {
      stats.recentErrors++;
    }
  }

  return stats;
}

/**
 * Clear all audit logs (use carefully - mainly for testing)
 */
export function clearAuditLogs(): number {
  const count = auditLogBuffer.length;
  auditLogBuffer.length = 0;
  return count;
}

// ============================================================================
// DATABASE RETRIEVAL FUNCTIONS (for historical analysis & admin dashboard)
// ============================================================================

/**
 * Get audit logs from database (for historical queries)
 */
export async function getAuditLogsFromDb(options: {
  limit?: number;
  offset?: number;
  category?: string;
  severity?: string;
  userId?: string;
  since?: Date;
  until?: Date;
  action?: string;
} = {}): Promise<{
  logs: Array<{
    id: string;
    severity: string;
    category: string;
    action: string;
    message: string | null;
    userId: string | null;
    requestId: string | null;
    ipAddress: string | null;
    method: string | null;
    path: string | null;
    statusCode: number | null;
    details: string | null;
    createdAt: Date;
  }>;
  total: number;
}> {
  const whereClause: Record<string, unknown> = {};
  
  if (options.category) whereClause.category = options.category;
  if (options.severity) whereClause.severity = options.severity;
  if (options.userId) whereClause.userId = options.userId;
  if (options.action) whereClause.action = { contains: options.action };
  if (options.since || options.until) {
    whereClause.createdAt = {};
    if (options.since) (whereClause.createdAt as Record<string, unknown>).gte = options.since;
    if (options.until) (whereClause.createdAt as Record<string, unknown>).lte = options.until;
  }
  
  const limit = Math.min(options.limit || 50, 500); // Max 500 per request
  const offset = options.offset || 0;
  
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.auditLog.count({ where: whereClause }),
  ]);
  
  return { logs, total };
}

/**
 * Get audit log statistics from database
 */
export async function getAuditStatsFromDb(options: {
  since?: Date;
  until?: Date;
} = {}): Promise<{
  totalLogs: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: number;
  uniqueUsers: number;
  uniqueIps: number;
}> {
  const whereClause: Record<string, unknown> = {};
  
  if (options.since || options.until) {
    whereClause.createdAt = {};
    if (options.since) (whereClause.createdAt as Record<string, unknown>).gte = options.since;
    if (options.until) (whereClause.createdAt as Record<string, unknown>).lte = options.until;
  }
  
  const [logs, severityGroup, categoryGroup] = await Promise.all([
    db.auditLog.count({ where: whereClause }),
    db.auditLog.groupBy({
      by: ['severity'],
      _count: { severity: true },
      where: whereClause,
    }),
    db.auditLog.groupBy({
      by: ['category'],
      _count: { category: true },
      where: whereClause,
    }),
  ]);
  
  // Count errors in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentErrors = await db.auditLog.count({
    where: {
      ...whereClause,
      createdAt: { gte: oneHourAgo },
      severity: { in: ['error', 'critical'] },
    }
  });
  
  // Get unique users and IPs count
  const [uniqueUsersResult, uniqueIpsResult] = await Promise.all([
    db.auditLog.groupBy({
      by: ['userId'],
      where: { ...whereClause, userId: { not: null } },
    }),
    db.auditLog.groupBy({
      by: ['ipAddress'],
      where: { ...whereClause, ipAddress: { not: null } },
    }),
  ]);
  
  return {
    totalLogs: logs,
    bySeverity: Object.fromEntries(severityGroup.map(s => [s.severity, s._count.severity])),
    byCategory: Object.fromEntries(categoryGroup.map(c => [c.category, c._count.category])),
    recentErrors,
    uniqueUsers: uniqueUsersResult.length,
    uniqueIps: uniqueIpsResult.length,
  };
}
