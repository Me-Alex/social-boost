import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tasks/[id] - Get single task details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await db.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        completer: { select: { id: true, name: true } },
        campaign: { 
          select: { 
            id: true, 
            platform: true, 
            serviceType: true,
            targetUrl: true,
            quantity: true,
            completedCount: true
          } 
        }
      }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ task });
    
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task (complete, claim, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, userId, timeSpentMs } = body;
    
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'claim': {
        // Claim a task for completion
        if (task.status !== 'pending') {
          return NextResponse.json(
            { error: `Task is ${task.status}, cannot claim` },
            { status: 400 }
          );
        }
        
        // Don't allow claiming own tasks
        if (task.creatorId === userId) {
          return NextResponse.json(
            { error: 'Cannot complete your own task' },
            { status: 400 }
          );
        }
        
        const updated = await db.task.update({
          where: { id },
          data: {
            status: 'claimed',
            claimedAt: new Date(),
            completerId: userId
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          task: updated,
          message: 'Task claimed successfully'
        });
      }
      
      case 'start': {
        // Mark task as in progress
        if (task.status !== 'claimed') {
          return NextResponse.json(
            { error: 'Task must be claimed first' },
            { status: 400 }
          );
        }
        
        const updated = await db.task.update({
          where: { id },
          data: {
            status: 'in_progress',
            startedAt: new Date()
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          task: updated,
          message: 'Task started'
        });
      }
      
      case 'complete': {
        // Complete task and credit worker
        if (task.status !== 'in_progress' && task.status !== 'claimed') {
          return NextResponse.json(
            { error: `Task is ${task.status}, cannot complete` },
            { status: 400 }
          );
        }
        
        if (task.completerId !== userId) {
          return NextResponse.json(
            { error: 'You are not assigned to this task' },
            { status: 403 }
          );
        }
        
        // Credit the worker
        const [updatedTask, updatedUser] = await Promise.all([
          db.task.update({
            where: { id },
            data: {
              status: 'completed',
              completedAt: new Date(),
              timeSpentMs: timeSpentMs || null,
              verifiedAt: new Date(),
              verificationMethod: 'auto'
            }
          }),
          db.user.update({
            where: { id: userId },
            data: {
              credits: { increment: task.rewardCredits },
              totalEarned: { increment: task.rewardCredits },
              tasksCompleted: { increment: 1 }
            }
          })
        ]);
        
        // Update campaign completed count
        if (task.campaignId) {
          await db.campaign.update({
            where: { id: task.campaignId },
            data: { completedCount: { increment: 1 } }
          });
        }
        
        return NextResponse.json({ 
          success: true, 
          task: updatedTask,
          creditsEarned: task.rewardCredits,
          message: `Task completed! Earned ${task.rewardCredits} credits`
        });
      }
      
      case 'abandon': {
        // Abandon task back to queue
        if (task.completerId !== userId) {
          return NextResponse.json(
            { error: 'Not your task to abandon' },
            { status: 403 }
          );
        }
        
        const updated = await db.task.update({
          where: { id },
          data: {
            status: 'pending',
            claimedAt: null,
            startedAt: null,
            completerId: null
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          task: updated,
          message: 'Task abandoned and returned to queue'
        });
      }
      
      case 'cancel': {
        // Creator cancels their own task
        if (task.creatorId !== userId) {
          return NextResponse.json(
            { error: 'Only task creator can cancel' },
            { status: 403 }
          );
        }
        
        // Refund credits if not completed
        let refundAmount = 0;
        if (task.status === 'pending') {
          refundAmount = task.rewardCredits;
          await db.user.update({
            where: { id: userId },
            data: { credits: { increment: refundAmount } }
          });
        }
        
        const updated = await db.task.update({
          where: { id },
          data: { status: 'cancelled' }
        });
        
        return NextResponse.json({ 
          success: true, 
          task: updated,
          refundAmount,
          message: refundAmount > 0 ? `Task cancelled. ${refundAmount} credits refunded` : 'Task cancelled'
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Task PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task (only pending/failed)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    if (task.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Only task creator can delete' },
        { status: 403 }
      );
    }
    
    if (task.status === 'completed' || task.status === 'verified') {
      return NextResponse.json(
        { error: 'Cannot delete completed tasks' },
        { status: 400 }
      );
    }
    
    // Refund if pending
    if (task.status === 'pending') {
      await db.user.update({
        where: { id: userId! },
        data: { credits: { increment: task.rewardCredits } }
      });
    }
    
    await db.task.delete({ where: { id } });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted' 
    });
    
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
