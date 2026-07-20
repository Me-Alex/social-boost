import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tasks - List available tasks or user's tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Build filter
    const where: Record<string, unknown> = {};
    
    if (status === 'available') {
      // Get tasks not created by this user and pending
      where.status = 'pending';
      where.creatorId = { not: userId };
    } else if (status === 'my-created') {
      where.creatorId = userId;
    } else if (status === 'my-completing') {
      where.completerId = userId;
      where.status = { in: ['claimed', 'in_progress'] };
    } else if (status) {
      where.status = status;
    }
    
    if (platform) {
      where.platform = platform;
    }
    
    const tasks = await db.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        completer: { select: { id: true, name: true } },
        campaign: { select: { id: true, targetUrl: true, quantity: true } }
      }
    });
    
    // Get counts
    const [availableCount, myCreatedCount, myCompletingCount] = await Promise.all([
      db.task.count({ where: { status: 'pending', creatorId: { not: userId } } }),
      db.task.count({ where: { creatorId: userId } }),
      db.task.count({ where: { completerId: userId, status: { in: ['claimed', 'in_progress'] } } })
    ]);
    
    return NextResponse.json({
      tasks,
      counts: {
        available: availableCount,
        myCreated: myCreatedCount,
        myCompleting: myCompletingCount
      }
    });
    
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      campaignId,
      platform, 
      serviceType, 
      targetUrl, 
      targetId, 
      quantity = 1,
      creditsPerTask = 1 
    } = body;
    
    if (!userId || !platform || !serviceType || !targetUrl || !targetId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify user exists and has enough credits
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const totalCost = quantity * creditsPerTask;
    
    if (user.credits < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: totalCost, current: user.credits },
        { status: 400 }
      );
    }
    
    // Deduct credits
    await db.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: totalCost },
        totalSpent: { increment: totalCost },
        tasksCreated: { increment: quantity }
      }
    });
    
    // Update campaign if provided
    if (campaignId) {
      await db.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'active',
          startedAt: new Date(),
          creditsSpent: { increment: totalCost }
        }
      });
    }
    
    // Create tasks
    const tasks = [];
    for (let i = 0; i < quantity; i++) {
      tasks.push({
        campaignId: campaignId || null,
        creatorId: userId,
        platform,
        serviceType,
        targetUrl,
        targetId,
        rewardCredits: creditsPerTask,
        status: 'pending',
        priority: 1,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
        verificationCode: generateVerificationCode()
      });
    }
    
    const createdTasks = await db.task.createMany({ data: tasks });
    
    return NextResponse.json({
      success: true,
      quantity,
      totalCost,
      creditsRemaining: user.credits - totalCost,
      tasksCreated: createdTasks.count,
      message: `${quantity} task(s) created successfully`
    });
    
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create tasks' },
      { status: 500 }
    );
  }
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
