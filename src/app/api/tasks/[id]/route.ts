import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const taskIdSchema = z.string().cuid('Invalid task ID format');

const taskActionSchema = z.object({
  action: z.enum(['claim', 'start', 'complete', 'abandon', 'cancel'], { required_error: 'action is required' }),
  userId: z.string().min(1, 'userId is required'),
  timeSpentMs: z.coerce.number().int().nonnegative().optional()
});

const deleteTaskSchema = z.object({
  userId: z.string().min(1, 'userId is required')
});

// Valid task status transitions
const validTransitions: Record<string, string[]> = {
  'pending': ['claimed'],
  'claimed': ['in_progress', 'abandoned', 'pending'], // abandoned -> pending (re-queue)
  'in_progress': ['completed', 'failed', 'abandoned'],
  'completed': [], // terminal state
  'verified': [], // terminal state
  'failed': ['pending'], // can retry
  'cancelled': [] // terminal state
};

// GET /api/tasks/[id] - Get single task details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate task ID format
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }
    
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
    
    return NextResponse.json({ success: true, task });
    
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task', message: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Validate inputs
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid task ID format' },
        { status: 400 }
      );
    }
    
    const actionValidation = taskActionSchema.safeParse(body);
    if (!actionValidation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: actionValidation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { action, userId, timeSpentMs } = actionValidation.data;
    
    // Fetch task
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'claim': {
        // Validate transition
        if (!validTransitions[task.status]?.includes('claimed')) {
          return NextResponse.json(
            { error: `Task is ${task.status}, cannot claim`, currentStatus: task.status },
            { status: 409 }
          );
        }
        
        // Don't allow claiming own tasks
        if (task.creatorId === userId) {
          return NextResponse.json(
            { error: 'Cannot complete your own task' },
            { status: 400 }
          );
        }
        
        // Check if user already has an active task
        const activeTask = await db.task.findFirst({
          where: {
            completerId: userId,
            status: { in: ['claimed', 'in_progress'] }
          }
        });
        
        if (activeTask) {
          return NextResponse.json(
            { error: 'You already have an active task. Complete or abandon it first.', activeTaskId: activeTask.id },
            { status: 409 }
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
        if (!validTransitions[task.status]?.includes('in_progress')) {
          return NextResponse.json(
            { error: 'Task must be claimed first', currentStatus: task.status },
            { status: 400 }
          );
        }
        
        // Verify ownership
        if (task.completerId !== userId) {
          return NextResponse.json(
            { error: 'You are not assigned to this task' },
            { status: 403 }
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
        if (!['in_progress', 'claimed'].includes(task.status)) {
          return NextResponse.json(
            { error: `Task is ${task.status}, cannot complete`, currentStatus: task.status },
            { status: 400 }
          );
        }
        
        if (task.completerId !== userId) {
          return NextResponse.json(
            { error: 'You are not assigned to this task' },
            { status: 403 }
          );
        }
        
        // Use transaction for atomicity
        const result = await db.$transaction(async (tx) => {
          const [updatedTask, updatedUser] = await Promise.all([
            tx.task.update({
              where: { id },
              data: {
                status: 'completed',
                completedAt: new Date(),
                timeSpentMs: timeSpentMs || null,
                verifiedAt: new Date(),
                verificationMethod: 'auto'
              }
            }),
            tx.user.update({
              where: { id: userId },
              data: {
                credits: { increment: task.rewardCredits },
                totalEarned: { increment: task.rewardCredits },
                tasksCompleted: { increment: 1 },
                lastActiveAt: new Date()
              }
            })
          ]);
          
          // Update campaign completed count
          if (task.campaignId) {
            await tx.campaign.update({
              where: { id: task.campaignId },
              data: { completedCount: { increment: 1 } }
            });
          }
          
          return { updatedTask, updatedUser };
        });
        
        return NextResponse.json({ 
          success: true, 
          task: result.updatedTask,
          creditsEarned: task.rewardCredits,
          newBalance: result.updatedUser.credits,
          message: `Task completed! Earned ${task.rewardCredits} credits`
        });
      }
      
      case 'abandon': {
        if (task.completerId !== userId) {
          return NextResponse.json(
            { error: 'Not your task to abandon' },
            { status: 403 }
          );
        }
        
        if (!['claimed', 'in_progress'].includes(task.status)) {
          return NextResponse.json(
            { error: `Cannot abandon a ${task.status} task` },
            { status: 400 }
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
        if (task.creatorId !== userId) {
          return NextResponse.json(
            { error: 'Only task creator can cancel' },
            { status: 403 }
          );
        }
        
        if (['completed', 'verified', 'cancelled'].includes(task.status)) {
          return NextResponse.json(
            { error: `Cannot cancel a ${task.status} task` },
            { status: 400 }
          );
        }
        
        // Refund credits if pending
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
          { error: 'Invalid action', validActions: Object.keys(validTransitions) },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Task PATCH error:', error);
    
    // Handle specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'Record not found during operation' }, { status: 404 });
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: 'Foreign key constraint violated' }, { status: 400 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update task', message: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Validate inputs
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ error: 'Invalid task ID format' }, { status: 400 });
    }
    
    const userIdValidation = deleteTaskSchema.safeParse({ userId });
    if (!userIdValidation.success) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }
    
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    if (task.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Only task creator can delete' },
        { status: 403 }
      );
    }
    
    if (['completed', 'verified'].includes(task.status)) {
      return NextResponse.json(
        { error: 'Cannot delete completed tasks' },
        { status: 400 }
      );
    }
    
    // Use transaction for atomicity
    await db.$transaction(async (tx) => {
      // Refund if pending
      if (task.status === 'pending') {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: task.rewardCredits } }
        });
      }
      
      await tx.task.delete({ where: { id } });
    });
    
    return NextResponse.json({ 
      success: true, 
      refunded: task.status === 'pending' ? task.rewardCredits : 0,
      message: 'Task deleted' 
    });
    
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
