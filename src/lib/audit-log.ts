/**
 * Audit Logging Utility for SocialBoost
 * 
 * Provides structured logging for security-sensitive events.
 * Tracks: auth events, data modifications, admin actions, errors
 */

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

// In-memory log buffer (for demo - use proper logging service in production)
const auditLogBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

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
  if (params.request) {
    entry.ipAddress = params.request.headers.get('x-forwarded-for') || 
                      params.request.headers.get('x-real-ip') || 
                      'unknown';
    entry.userAgent = params.request.headers.get('user-agent')?.slice(0, 200);
  }

  // Add to buffer
  auditLogBuffer.push(entry);

  // Trim buffer if needed
  if (auditLogBuffer.length > MAX_BUFFER_SIZE) {
    auditLogBuffer.splice(0, auditLogBuffer.length - MAX_BUFFER_SIZE);
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
