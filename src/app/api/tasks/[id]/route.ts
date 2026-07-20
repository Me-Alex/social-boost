import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requireAuth, createSuccessResponse, createErrorResponse, createTimer, logAccess, isValidCuid } from '@/lib/api-utils';
import { logDataEvent, logSecurityEvent } from '@/lib/audit-log';

// Validation schemas
const taskIdSchema = z.string().cuid('Invalid task ID format');

const taskActionSchema = z.object({
  action: z.enum(['claim', 'start', 'complete', 'abandon', 'cancel'], { required_error: 'action is required' }),
  timeSpentMs: z.coerce.number().int().nonnegative().optional()
  // Note: userId is now extracted from auth session, not body
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

// GET /api/tasks/[id] - Get single task details (REQUIRES AUTHENTICATION)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const timer = createTimer();
  
  // REQUIRE authentication
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }
  
  const userId = authResult.session!.userId;
  
  try {
    const { id } = await params;
    
    // Validate task ID format
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return createErrorResponse(
        'Invalid task ID format',
        400,
        { code: 'INVALID_TASK_ID' },
        authResult.requestId
      );
    }
    
    const task = await db.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
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
      return createErrorResponse(
        'Task not found',
        404,
        { code: 'TASK_NOT_FOUND' },
        authResult.requestId
      );
    }
    
    const response = createSuccessResponse({ task }, 200, undefined, authResult.requestId);
    
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { taskId: id }
    });
    
    return response;
    
  } catch (error) {
    console.error('[Tasks API] GET by ID error:', error);
    
    return createErrorResponse(
      'Failed to fetch task',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
    );
  }
}

// PATCH /api/tasks/[id] - Update task (complete, claim, etc.) (REQUIRES AUTHENTICATION)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const timer = createTimer();
  
  // REQUIRE authentication
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }
  
  const userId = authResult.session!.userId;
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate inputs
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return createErrorResponse(
        'Invalid task ID format',
        400,
        { code: 'INVALID_TASK_ID' },
        authResult.requestId
      );
    }
    
    const actionValidation = taskActionSchema.safeParse(body);
    if (!actionValidation.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        { code: 'VALIDATION_ERROR', details: actionValidation.error.flatten().fieldErrors },
        authResult.requestId
      );
    }
    
    const { action, timeSpentMs } = actionValidation.data;
    
    // Fetch task
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return createErrorResponse(
        'Task not found',
        404,
        { code: 'TASK_NOT_FOUND' },
        authResult.requestId
      );
    }
    
    switch (action) {
      case 'claim': {
        // Validate transition
        if (!validTransitions[task.status]?.includes('claimed')) {
          return createErrorResponse(
            `Task is ${task.status}, cannot claim`,
            409,
            { code: 'INVALID_TRANSITION', currentStatus: task.status },
            authResult.requestId
          );
        }
        
        // Don't allow claiming own tasks
        if (task.creatorId === userId) {
          logSecurityEvent({
            action: 'permission_denied',
            severity: 'warning',
            userId,
            requestId: authResult.requestId,
            details: { action: 'claim_own_task', taskId: id },
            request,
          });
          
          return createErrorResponse(
            'Cannot complete your own task',
            400,
            { code: 'OWN_TASK_FORBIDDEN' },
            authResult.requestId
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
          return createErrorResponse(
            'You already have an active task. Complete or abandon it first.',
            409,
            { code: 'HAS_ACTIVE_TASK', activeTaskId: activeTask.id },
            authResult.requestId
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
        
        logDataEvent({
          action: 'update',
          entity: 'task',
          entityId: id,
          userId,
          success: true,
          requestId: authResult.requestId,
          details: { action: 'claim', previousStatus: task.status },
          request,
        });
        
        return createSuccessResponse({ 
          task: updated,
          message: 'Task claimed successfully'
        }, 200, undefined, authResult.requestId);
      }
      
      case 'start': {
        if (!validTransitions[task.status]?.includes('in_progress')) {
          return createErrorResponse(
            'Task must be claimed first',
            400,
            { code: 'INVALID_TRANSITION', currentStatus: task.status },
            authResult.requestId
          );
        }
        
        // Verify ownership
        if (task.completerId !== userId) {
          logSecurityEvent({
            action: 'permission_denied',
            severity: 'warning',
            userId,
            requestId: authResult.requestId,
            details: { action: 'start_task_not_owned', taskId: id },
            request,
          });
          
          return createErrorResponse(
            'You are not assigned to this task',
            403,
            { code: 'NOT_ASSIGNED' },
            authResult.requestId
          );
        }
        
        const updated = await db.task.update({
          where: { id },
          data: {
            status: 'in_progress',
            startedAt: new Date()
          }
        });
        
        logDataEvent({
          action: 'update',
          entity: 'task',
          entityId: id,
          userId,
          success: true,
          requestId: authResult.requestId,
          details: { action: 'start' },
          request,
        });
        
        return createSuccessResponse({ 
          task: updated,
          message: 'Task started'
        }, 200, undefined, authResult.requestId);
      }
      
      case 'complete': {
        if (!['in_progress', 'claimed'].includes(task.status)) {
          return createErrorResponse(
            `Task is ${task.status}, cannot complete`,
            400,
            { code: 'INVALID_TRANSITION', currentStatus: task.status },
            authResult.requestId
          );
        }
        
        if (task.completerId !== userId) {
          logSecurityEvent({
            action: 'permission_denied',
            severity: 'warning',
            userId,
            requestId: authResult.requestId,
            details: { action: 'complete_task_not_owned', taskId: id },
            request,
          });
          
          return createErrorResponse(
            'You are not assigned to this task',
            403,
            { code: 'NOT_ASSIGNED' },
            authResult.requestId
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
        
        logDataEvent({
          action: 'update',
          entity: 'task',
          entityId: id,
          userId,
          success: true,
          requestId: authResult.requestId,
          details: { 
            action: 'complete', 
            creditsEarned: task.rewardCredits,
            timeSpentMs 
          },
          request,
        });
        
        return createSuccessResponse({ 
          task: result.updatedTask,
          creditsEarned: task.rewardCredits,
          newBalance: result.updatedUser.credits,
          message: `Task completed! Earned ${task.rewardCredits} credits`
        }, 200, undefined, authResult.requestId);
      }
      
      case 'abandon': {
        if (task.completerId !== userId) {
          logSecurityEvent({
            action: 'permission_denied',
            severity: 'warning',
            userId,
            requestId: authResult.requestId,
            details: { action: 'abandon_task_not_owned', taskId: id },
            request,
          });
          
          return createErrorResponse(
            'Not your task to abandon',
            403,
            { code: 'NOT_ASSIGNED' },
            authResult.requestId
          );
        }
        
        if (!['claimed', 'in_progress'].includes(task.status)) {
          return createErrorResponse(
            `Cannot abandon a ${task.status} task`,
            400,
            { code: 'INVALID_TRANSITION', currentStatus: task.status },
            authResult.requestId
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
        
        logDataEvent({
          action: 'update',
          entity: 'task',
          entityId: id,
          userId,
          success: true,
          requestId: authResult.requestId,
          details: { action: 'abandon', previousStatus: task.status },
          request,
        });
        
        return createSuccessResponse({ 
          task: updated,
          message: 'Task abandoned and returned to queue'
        }, 200, undefined, authResult.requestId);
      }
      
      case 'cancel': {
        if (task.creatorId !== userId) {
          logSecurityEvent({
            action: 'permission_denied',
            severity: 'warning',
            userId,
            requestId: authResult.requestId,
            details: { action: 'cancel_task_not_owned', taskId: id },
            request,
          });
          
          return createErrorResponse(
            'Only task creator can cancel',
            403,
            { code: 'NOT_CREATOR' },
            authResult.requestId
          );
        }
        
        if (['completed', 'verified', 'cancelled'].includes(task.status)) {
          return createErrorResponse(
            `Cannot cancel a ${task.status} task`,
            400,
            { code: 'INVALID_TRANSITION', currentStatus: task.status },
            authResult.requestId
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
        
        logDataEvent({
          action: 'update',
          entity: 'task',
          entityId: id,
          userId,
          success: true,
          requestId: authResult.requestId,
          details: { action: 'cancel', refundAmount, previousStatus: task.status },
          request,
        });
        
        return createSuccessResponse({ 
          task: updated,
          refundAmount,
          message: refundAmount > 0 ? `Task cancelled. ${refundAmount} credits refunded` : 'Task cancelled'
        }, 200, undefined, authResult.requestId);
      }
      
      default:
        return createErrorResponse(
          'Invalid action',
          400,
          { code: 'INVALID_ACTION', validActions: Object.keys(validTransitions) },
          authResult.requestId
        );
    }
    
  } catch (error) {
    console.error('[Tasks API] PATCH error:', error);
    
    // Log failed attempt
    logDataEvent({
      action: 'update',
      entity: 'task',
      entityId: id,
      userId,
      success: false,
      requestId: authResult.requestId,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      request,
    });
    
    // Handle specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2025') {
        return createErrorResponse('Record not found during operation', 404, { code: 'NOT_FOUND' }, authResult.requestId);
      }
      if (prismaError.code === 'P2003') {
        return createErrorResponse('Foreign key constraint violated', 400, { code: 'CONSTRAINT_VIOLATION' }, authResult.requestId);
      }
    }
    
    return createErrorResponse(
      'Failed to update task',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
    );
  }
}

// DELETE /api/tasks/[id] - Delete task (only pending/failed) (REQUIRES AUTHENTICATION)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const timer = createTimer();
  
  // REQUIRE authentication
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }
  
  const userId = authResult.session!.userId;
  
  try {
    const { id } = await params;
    
    // Validate inputs
    const idValidation = taskIdSchema.safeParse(id);
    if (!idValidation.success) {
      return createErrorResponse(
        'Invalid task ID format',
        400,
        { code: 'INVALID_TASK_ID' },
        authResult.requestId
      );
    }
    
    const task = await db.task.findUnique({ where: { id } });
    
    if (!task) {
      return createErrorResponse(
        'Task not found',
        404,
        { code: 'TASK_NOT_FOUND' },
        authResult.requestId
      );
    }
    
    if (task.creatorId !== userId) {
      logSecurityEvent({
        action: 'permission_denied',
        severity: 'warning',
        userId,
        requestId: authResult.requestId,
        details: { action: 'delete_task_not_owned', taskId: id },
        request,
      });
      
      return createErrorResponse(
        'Only task creator can delete',
        403,
        { code: 'NOT_CREATOR' },
        authResult.requestId
      );
    }
    
    if (['completed', 'verified'].includes(task.status)) {
      return createErrorResponse(
        'Cannot delete completed tasks',
        400,
        { code: 'CANNOT_DELETE_COMPLETED' },
        authResult.requestId
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
    
    logDataEvent({
      action: 'delete',
      entity: 'task',
      entityId: id,
      userId,
      success: true,
      requestId: authResult.requestId,
      details: { refunded: task.status === 'pending' ? task.rewardCredits : 0 },
      request,
    });
    
    const response = createSuccessResponse({ 
      refunded: task.status === 'pending' ? task.rewardCredits : 0,
      message: 'Task deleted' 
    }, 200, undefined, authResult.requestId);
    
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { taskId: id, action: 'delete' }
    });
    
    return response;
    
  } catch (error) {
    console.error('[Tasks API] DELETE error:', error);
    
    return createErrorResponse(
      'Failed to delete task',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
    );
  }
}
