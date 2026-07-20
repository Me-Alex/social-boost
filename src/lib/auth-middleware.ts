/**
 * Authentication Middleware for SocialBoost API Routes
 * 
 * Provides token-based authentication verification for protecting API endpoints.
 * This is a lightweight implementation - for production, consider using NextAuth.js
 * or a more robust JWT solution.
 */

import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// Token storage (in-memory for demo - use Redis/Database in production)
const activeSessions = new Map<string, {
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}>();

// Token expiration time (24 hours)
const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Session interface
 */
export interface AuthSession {
  userId: string;
  tokenId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Verify authentication token from request
 * Checks Authorization header or query parameter
 */
export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  session?: AuthSession;
  error?: string;
  errorCode?: string;
}> {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Fallback to query parameter (less secure but useful for WebSocket/etc)
  if (!token) {
    const { searchParams } = new URL(request.url);
    token = searchParams.get('token');
  }
  
  if (!token) {
    return {
      authenticated: false,
      error: 'Authentication required. Please provide a valid token.',
      errorCode: 'AUTH_REQUIRED'
    };
  }
  
  // Validate token format (basic check)
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return {
      authenticated: false,
      error: 'Invalid token format.',
      errorCode: 'INVALID_TOKEN'
    };
  }
  
  // Look up session
  const session = activeSessions.get(token);
  
  if (!session) {
    return {
      authenticated: false,
      error: 'Token not found or expired. Please login again.',
      errorCode: 'SESSION_NOT_FOUND'
    };
  }
  
  // Check expiration
  if (Date.now() > session.expiresAt.getTime()) {
    activeSessions.delete(token); // Clean up expired session
    return {
      authenticated: false,
      error: 'Token has expired. Please login again.',
      errorCode: 'TOKEN_EXPIRED'
    };
  }
  
  // Verify user still exists and is active
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isActive: true }
    });
    
    if (!user || !user.isActive) {
      activeSessions.delete(token);
      return {
        authenticated: false,
        error: 'Account is no longer active.',
        errorCode: 'ACCOUNT_INACTIVE'
      };
    }
    
    // Update last activity tracking (optional)
    session.expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS); // Renew
    
    return {
      authenticated: true,
      session: {
        userId: session.userId,
        tokenId: token,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }
    };
  } catch (error) {
    console.error('[AuthMiddleware] Error verifying user:', error);
    return {
      authenticated: false,
      error: 'Authentication error.',
      errorCode: 'AUTH_ERROR'
    };
  }
}

/**
 * Create a new session for a user
 */
export function createSession(
  userId: string, 
  token: string,
  metadata?: { userAgent?: string; ip?: string }
): void {
  const now = new Date();
  
  activeSessions.set(token, {
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + TOKEN_EXPIRATION_MS),
    ...metadata
  });
  
  // Clean up any old sessions for this user (keep max 5 sessions per user)
  cleanupOldSessions(userId);
}

/**
 * Invalidate/delete a session
 */
export function destroySession(token: string): boolean {
  return activeSessions.delete(token);
}

/**
 * Destroy all sessions for a user (e.g., on password change)
 */
export function destroyAllUserSessions(userId: string): number {
  let count = 0;
  for (const [token, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      activeSessions.delete(token);
      count++;
    }
  }
  return count;
}

/**
 * Get all active sessions for a user (for "active sessions" display)
 */
export function getUserSessions(userId: string): Array<{
  tokenId: string;
  createdAt: Date;
  expiresAt: Date;
  current: boolean; // Would need request context to determine
}> {
  const sessions: Array<{
    tokenId: string;
    createdAt: Date;
    expiresAt: Date;
    current: boolean;
  }> = [];
  
  for (const [tokenId, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      sessions.push({
        tokenId: tokenId.slice(0, 8) + '...', // Partial ID for display
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        current: false // Would be set based on comparing with current token
      });
    }
  }
  
  return sessions;
}

/**
 * Cleanup old sessions for a user (keep only the most recent N)
 */
function cleanupOldSessions(userId: string, maxSessions: number = 5): void {
  const userSessions = Array.from(activeSessions.entries())
    .filter(([, session]) => session.userId === userId)
    .sort(([, a], [, b]) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Remove oldest sessions beyond limit
  if (userSessions.length > maxSessions) {
    for (let i = maxSessions; i < userSessions.length; i++) {
      activeSessions.delete(userSessions[i][0]);
    }
  }
}

/**
 * Cleanup ALL expired sessions (call periodically)
 */
export function cleanupExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt.getTime()) {
      activeSessions.delete(token);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Auto-cleanup expired sessions every 10 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const cleaned = cleanupExpiredSessions();
    if (cleaned > 0) {
      console.log(`[AuthMiddleware] Cleaned up ${cleaned} expired sessions`);
    }
  }, 10 * 60 * 1000);
}

/**
 * Get session statistics (for admin monitoring)
 */
export function getSessionStats(): {
  totalActive: number;
  uniqueUsers: number;
} {
  const users = new Set<string>();
  
  for (const session of activeSessions.values()) {
    users.add(session.userId);
  }
  
  return {
    totalActive: activeSessions.size,
    uniqueUsers: users.size
  };
}
