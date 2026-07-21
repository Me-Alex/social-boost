/**
 * System Stats API Endpoint for Admin Dashboard
 * 
 * Provides comprehensive system statistics for monitoring.
 * Requires authentication.
 * 
 * GET /api/admin/stats - Retrieve system statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { getAuditStatsFromDb, getRecentLogs } from '@/lib/audit-log';
import { getSessionStats } from '@/lib/auth-middleware';
import { db } from '@/lib/db';

interface SystemStats {
  // Timestamps
  timestamp: string;
  uptime?: number;
  
  // User Statistics
  users: {
    total: number;
    active: number;
    createdToday: number;
    createdThisWeek: number;
  };
  
  // Session Statistics
  sessions: {
    totalActive: number;
    uniqueUsers: number;
  };
  
  // Campaign Statistics
  campaigns: {
    total: number;
    active: number;
    pendingTasks: number;
  };
  
  // Task Statistics
  tasks: {
    total: number;
    pending: number;
    claimed: number;
    completed: number;
    cancelled: number;
    completedToday: number;
  };
  
  // Audit Log Statistics
  auditLogs: {
    totalLogs: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    recentErrors: number;
    uniqueUsers: number;
    uniqueIps: number;
  };
  
  // Recent Security Events (last 24 hours)
  recentSecurityEvents: Array<{
    action: string;
    severity: string;
    userId?: string;
    timestamp: string;
  }>;
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Authenticate request
    const authResult = await requireAuth(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Run all independent queries in parallel
    const [
      totalUsers,
      activeUsers,
      usersCreatedToday,
      usersCreatedThisWeek,
      totalCampaigns,
      activeCampaigns,
      tasksByStatus,
      tasksCompletedToday,
      auditStats,
      recentSecurityLogs,
      sessionStats,
    ] = await Promise.all([
      // User stats
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
      db.user.count({ where: { createdAt: { gte: weekStart } } }),
      
      // Campaign stats
      db.campaign.count(),
      db.campaign.count({ where: { status: 'active' } }),
      
      // Task stats - get counts by status
      Promise.all([
        db.task.count(),
        db.task.count({ where: { status: 'pending' } }),
        db.task.count({ where: { status: 'claimed' } }),
        db.task.count({ where: { status: 'completed' } }),
        db.task.count({ where: { status: 'cancelled' } }),
        db.task.count({ 
          where: { 
            status: 'completed',
            completedAt: { gte: todayStart }
          }
        }),
      ]),
      
      // Audit log stats
      getAuditStatsFromDb({ since: yesterday }),
      
      // Recent security events (last 24 hours)
      Promise.resolve(getRecentLogs({ 
        category: 'security', 
        since: yesterday,
        limit: 20 
      })),
      
      // Session stats
      Promise.resolve(getSessionStats()),
    ]);
    
    // Build response object
    const stats: SystemStats = {
      timestamp: now.toISOString(),
      
      users: {
        total: totalUsers,
        active: activeUsers,
        createdToday: usersCreatedToday,
        createdThisWeek: usersCreatedThisWeek,
      },
      
      sessions: {
        totalActive: sessionStats.totalActive,
        uniqueUsers: sessionStats.uniqueUsers,
      },
      
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        pendingTasks: tasksByStatus[1], // pending count
      },
      
      tasks: {
        total: tasksByStatus[0],
        pending: tasksByStatus[1],
        claimed: tasksByStatus[2],
        completed: tasksByStatus[3],
        cancelled: tasksByStatus[4],
        completedToday: tasksByStatus[5],
      },
      
      auditLogs: auditStats,
      
      recentSecurityEvents: recentSecurityLogs.map(log => ({
        action: log.action,
        severity: log.severity,
        userId: log.userId,
        timestamp: log.timestamp,
      })),
    };
    
    const durationMs = Math.round(performance.now() - startTime);
    
    return NextResponse.json({
      success: true,
      stats,
      meta: {
        durationMs,
        requestedAt: now.toISOString(),
        generatedBy: 'SocialBoost Admin Stats API v1.0',
      }
    });
    
  } catch (error) {
    console.error('[AdminStatsAPI] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve system statistics', 
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
