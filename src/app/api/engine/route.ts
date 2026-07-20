import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { optionalAuth, createSuccessResponse, createErrorResponse, createTimer, logAccess } from '@/lib/api-utils';

// GET /api/engine/stats - Get engine statistics (public endpoint with enhanced data for authenticated users)
export async function GET(request: Request) {
  const timer = createTimer();
  
  // Optional auth - public endpoint but with more data for authenticated users
  const req = request as unknown as import('next/server').NextRequest;
  const authResult = await optionalAuth(req);
  
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get various counts in parallel
    const [
      totalTasks,
      pendingTasks,
      activeTasks,
      completedTasks,
      failedTasks,
      todayTasks,
      totalUsers,
      activeUsers,
      totalCreditsExchanged,
      platformBreakdown
    ] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: 'pending' } }),
      db.task.count({ where: { status: { in: ['claimed', 'in_progress'] } } }),
      db.task.count({ where: { status: 'completed' } }),
      db.task.count({ where: { status: 'failed' } }),
      db.task.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      db.user.count(),
      db.user.count({
        where: {
          lastActiveAt: { gte: new Date(now.getTime() - 30 * 60 * 1000) }
        }
      }),
      db.task.aggregate({
        _sum: { rewardCredits: true },
        where: { status: 'completed' }
      }),
      // Platform breakdown
      db.task.groupBy({
        by: ['platform', 'status'],
        _count: true
      })
    ]);
    
    // Calculate platform stats
    const platforms: Record<string, { total: number; pending: number; completed: number }> = {};
    for (const item of platformBreakdown) {
      if (!platforms[item.platform]) {
        platforms[item.platform] = { total: 0, pending: 0, completed: 0 };
      }
      (platforms[item.platform] as Record<string, number>).total += item._count;
      (platforms[item.platform] as Record<string, number>)[item.status] = item._count;
    }
    
    // Build response with base data available to everyone
    const responseData: Record<string, unknown> = {
      engine: {
        status: 'running',
        uptime: Math.round(process.uptime()),
        timestamp: now.toISOString()
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        active: activeTasks,
        completed: completedTasks,
        failed: failedTasks,
        createdToday: todayTasks
      },
      users: {
        total: totalUsers,
        activeLast30min: activeUsers
      },
      credits: {
        totalExchanged: totalCreditsExchanged._sum.rewardCredits || 0
      },
      platforms,
      
      // Quick stats for dashboard
      summary: {
        tasksPerHour: todayTasks > 0 ? Math.round(todayTasks / (now.getHours() + 1)) : 0,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        avgWaitTime: pendingTasks > 0 ? `${Math.ceil(pendingTasks / Math.max(activeTasks, 1))} min` : '< 1 min'
      }
    };
    
    // Add additional data for authenticated users
    if (authResult.session) {
      // Could add user-specific stats here in the future
      responseData.authenticated = true;
    }
    
    const response = createSuccessResponse(
      responseData,
      200,
      undefined,
      authResult.requestId
    );
    
    logAccess({
      request: req,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId: authResult.session?.userId,
      requestId: authResult.requestId,
      details: { endpoint: 'GET /api/engine/stats' }
    });
    
    return response;
    
  } catch (error) {
    console.error('[Engine API] Stats error:', error);
    
    return createErrorResponse(
      'Failed to fetch engine stats',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
    );
  }
}
