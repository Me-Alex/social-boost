import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/engine/stats - Get engine statistics
export async function GET() {
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
    const platforms = {};
    for (const item of platformBreakdown) {
      if (!platforms[item.platform]) {
        platforms[item.platform] = { total: 0, pending: 0, completed: 0 };
      }
      (platforms[item.platform] as Record<string, number>).total += item._count;
      (platforms[item.platform] as Record<string, number>)[item.status] = item._count;
    }
    
    return NextResponse.json({
      engine: {
        status: 'running',
        uptime: process.uptime(),
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
        tasksPerHour: Math.round(todayTasks / (now.getHours() + 1)),
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        avgWaitTime: pendingTasks > 0 ? `${Math.ceil(pendingTasks / Math.max(activeTasks, 1))} min` : '< 1 min'
      }
    });
    
  } catch (error) {
    console.error('Engine stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engine stats' },
      { status: 500 }
    );
  }
}
