import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requireAuth, createSuccessResponse, createErrorResponse, createTimer, logAccess, isValidCuid } from '@/lib/api-utils';
import { logDataEvent, logSecurityEvent } from '@/lib/audit-log';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Allowed platforms and service types (whitelist approach)
const ALLOWED_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'] as const;
const ALLOWED_SERVICE_TYPES = ['views', 'subscribers', 'likes', 'comments', 'followers', 'reels_views', 'story_views', 'shares', 'retweets'] as const;

// URL validation patterns
const YOUTUBE_URL_PATTERN = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
const INSTAGRAM_URL_PATTERN = /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/.+/i;
const TIKTOK_URL_PATTERN = /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+/i;
const TWITTER_URL_PATTERN = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/i;
const FACEBOOK_URL_PATTERN = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;

/**
 * Validate URL against platform-specific patterns
 */
function validatePlatformUrl(url: string, platform: string): boolean {
  try {
    // Basic URL format check
    new URL(url);
    
    switch (platform) {
      case 'youtube': return YOUTUBE_URL_PATTERN.test(url);
      case 'instagram': return INSTAGRAM_URL_PATTERN.test(url);
      case 'tiktok': return TIKTOK_URL_PATTERN.test(url);
      case 'twitter': return TWITTER_URL_PATTERN.test(url);
      case 'facebook': return FACEBOOK_URL_PATTERN.test(url);
      default: return false;
    }
  } catch {
    return false;
  }
}

/**
 * Sanitize URL - remove tracking parameters and normalize
 */
function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove dangerous/tracking query params
    const dangerousParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 
                            'fbclid', 'gclid', '_ga', 'ref', 'si', 'feature', 't'];
    
    for (const param of dangerousParams) {
      urlObj.searchParams.delete(param);
    }
    
    // Force HTTPS
    if (urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:';
    }
    
    return urlObj.toString();
  } catch {
    return url; // Return original if parsing fails
  }
}

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, ''); // Remove potential HTML characters
}

/**
 * Simple rate limiter for tasks API
 */
const taskRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const TASK_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const TASK_RATE_LIMIT_MAX = 30; // requests per window

function checkTaskRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = taskRateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    taskRateLimitStore.set(identifier, { count: 1, resetTime: now + TASK_RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: TASK_RATE_LIMIT_MAX - 1, resetTime: now + TASK_RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= TASK_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: TASK_RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

// Cleanup old rate limit entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of taskRateLimitStore.entries()) {
      if (now > value.resetTime) {
        taskRateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// Validation schemas
const taskQuerySchema = z.object({
  status: z.enum(['pending', 'claimed', 'in_progress', 'completed', 'verified', 'failed', 'cancelled', 'available']).optional(),
  platform: z.enum(ALLOWED_PLATFORMS).optional(),
  limit: z.coerce.number().min(1).max(100).default(20)
});

const createTaskSchema = z.object({
  campaignId: z.string().optional(),
  platform: z.enum(ALLOWED_PLATFORMS, { required_error: 'platform is required' }),
  serviceType: z.enum(ALLOWED_SERVICE_TYPES, { required_error: 'serviceType is required' }),
  targetUrl: z.string().min(1, 'targetUrl is required'),
  targetId: z.string().min(1).max(100, 'targetId must be 1-100 characters'),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  creditsPerTask: z.coerce.number().int().min(1).max(10).default(1)
});

// GET /api/tasks - List available tasks or user's tasks (REQUIRES AUTHENTICATION)
export async function GET(request: NextRequest) {
  const timer = createTimer();
  
  // REQUIRE authentication for accessing tasks
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }
  
  const userId = authResult.session!.userId;
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validationResult = taskQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    
    if (!validationResult.success) {
      return createErrorResponse(
        'Invalid query parameters',
        400,
        { 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors 
        },
        authResult.requestId
      );
    }
    
    const { status, platform, limit } = validationResult.data;
    
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkTaskRateLimit(`tasks:get:${userId}:${clientIp}`);
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        action: 'rate_limit_exceeded',
        severity: 'warning',
        userId,
        requestId: authResult.requestId,
        details: { endpoint: 'GET /api/tasks' },
        request,
      });
      
      return createErrorResponse(
        'Rate limit exceeded',
        429,
        { code: 'RATE_LIMITED', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        authResult.requestId
      );
    }
    
    // Build filter based on authenticated user
    const where: Record<string, unknown> = {};
    
    if (status === 'available') {
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
    
    // Default: show available tasks + user's own tasks
    if (!status) {
      where.OR = [
        { status: 'pending', creatorId: { not: userId } },
        { creatorId: userId },
        { completerId: userId },
      ];
    }
    
    if (platform) {
      where.platform = platform;
    }
    
    const [tasks, counts] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          creator: { select: { id: true, name: true } },
          completer: { select: { id: true, name: true } },
          campaign: { select: { id: true, targetUrl: true, quantity: true } }
        }
      }),
      // Get counts in parallel
      Promise.all([
        db.task.count({ where: { status: 'pending', creatorId: { not: userId } } }),
        db.task.count({ where: { creatorId: userId } }),
        db.task.count({ where: { completerId: userId, status: { in: ['claimed', 'in_progress'] } } })
      ])
    ]);
    
    const [availableCount, myCreatedCount, myCompletingCount] = counts;
    
    const response = createSuccessResponse({
      tasks,
      counts: {
        available: availableCount,
        myCreated: myCreatedCount,
        myCompleting: myCompletingCount
      },
      pagination: {
        limit,
        hasMore: tasks.length === limit
      }
    }, 200, undefined, authResult.requestId);
    
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { taskCount: tasks.length, status: status || 'all' }
    });
    
    return response;
    
  } catch (error) {
    console.error('[Tasks API] GET error:', error);
    
    return createErrorResponse(
      'Failed to fetch tasks',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
    );
  }
}

// POST /api/tasks - Create new task(s) (REQUIRES AUTHENTICATION)
export async function POST(request: NextRequest) {
  const timer = createTimer();
  
  // REQUIRE authentication for creating tasks
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!;
  }
  
  const userId = authResult.session!.userId;
  
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = createTaskSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        { 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors 
        },
        authResult.requestId
      );
    }
    
    const { campaignId, platform, serviceType, targetUrl, targetId, quantity, creditsPerTask } = validationResult.data;
    
    // Validate and sanitize URL for specific platform
    const sanitizedUrl = sanitizeUrl(targetUrl);
    if (!validatePlatformUrl(sanitizedUrl, platform)) {
      return createErrorResponse(
        `Invalid ${platform} URL. Please provide a valid ${platform} link.`,
        400,
        { code: 'INVALID_URL' },
        authResult.requestId
      );
    }
    
    // Sanitize targetId
    const sanitizedTargetId = sanitizeString(targetId, 100);
    
    // Rate limiting for task creation (stricter)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkTaskRateLimit(`tasks:create:${userId}:${clientIp}`);
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        action: 'rate_limit_exceeded',
        severity: 'warning',
        userId,
        requestId: authResult.requestId,
        details: { endpoint: 'POST /api/tasks' },
        request,
      });
      
      return createErrorResponse(
        'Too many tasks created. Please wait before creating more.',
        429,
        { code: 'RATE_LIMITED', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        authResult.requestId
      );
    }
    
    // Verify user exists and get current state
    const user = await db.user.findUnique({ 
      where: { id: userId },
      select: { id: true, credits: true, isActive: true }
    });
    
    if (!user) {
      return createErrorResponse('User not found', 404, { code: 'USER_NOT_FOUND' }, authResult.requestId);
    }
    
    if (!user.isActive) {
      return createErrorResponse('Account is suspended', 403, { code: 'ACCOUNT_SUSPENDED' }, authResult.requestId);
    }
    
    const totalCost = quantity * creditsPerTask;
    
    if (user.credits < totalCost) {
      return createErrorResponse(
        'Insufficient credits',
        400,
        { 
          code: 'INSUFFICIENT_CREDITS',
          required: totalCost, 
          current: user.credits, 
          shortfall: totalCost - user.credits 
        },
        authResult.requestId
      );
    }
    
    // Verify campaign exists if provided
    if (campaignId) {
      if (!isValidCuid(campaignId)) {
        return createErrorResponse('Invalid campaign ID format', 400, { code: 'INVALID_CAMPAIGN_ID' }, authResult.requestId);
      }
      
      const campaign = await db.campaign.findUnique({ 
        where: { id: campaignId },
        select: { id: true, userId: true }
      });
      
      if (!campaign) {
        return createErrorResponse('Campaign not found', 404, { code: 'CAMPAIGN_NOT_FOUND' }, authResult.requestId);
      }
      
      if (campaign.userId !== userId) {
        logSecurityEvent({
          action: 'permission_denied',
          severity: 'warning',
          userId,
          requestId: authResult.requestId,
          details: { action: 'create_task_for_campaign', campaignId },
          request,
        });
        
        return createErrorResponse('Campaign does not belong to this user', 403, { code: 'FORBIDDEN' }, authResult.requestId);
      }
    }
    
    // Use transaction for data consistency
    const result = await db.$transaction(async (tx) => {
      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: totalCost },
          totalSpent: { increment: totalCost },
          tasksCreated: { increment: quantity }
        }
      });
      
      // Update campaign if provided
      if (campaignId) {
        await tx.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'active',
            startedAt: new Date(),
            creditsSpent: { increment: totalCost }
          }
        });
      }
      
      // Create tasks in batch
      const tasks = Array.from({ length: quantity }, () => ({
        campaignId: campaignId || null,
        creatorId: userId,
        platform,
        serviceType,
        targetUrl: sanitizedUrl,
        targetId: sanitizedTargetId,
        rewardCredits: creditsPerTask,
        status: 'pending',
        priority: 1,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
        verificationCode: generateVerificationCode()
      }));
      
      const createdTasks = await tx.task.createMany({ data: tasks });
      
      return { updatedUser, tasksCreated: createdTasks.count };
    });
    
    // Log successful creation
    logDataEvent({
      action: quantity > 1 ? 'bulk_create' : 'create',
      entity: 'task',
      userId,
      success: true,
      requestId: authResult.requestId,
      details: {
        quantity,
        platform,
        serviceType,
        totalCost,
        campaignId: campaignId || null,
      },
      request,
    });
    
    const response = createSuccessResponse({
      quantity,
      totalCost,
      creditsRemaining: result.updatedUser.credits,
      tasksCreated: result.tasksCreated,
      message: `${quantity} task(s) created successfully`
    }, 201, undefined, authResult.requestId);
    
    logAccess({
      request,
      statusCode: 201,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { quantity, totalCost }
    });
    
    return response;
    
  } catch (error) {
    console.error('[Tasks API] POST error:', error);
    
    // Log failed attempt
    logDataEvent({
      action: 'create',
      entity: 'task',
      userId,
      success: false,
      requestId: authResult.requestId,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      request,
    });
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2002') {
        return createErrorResponse('A unique constraint was violated', 409, { code: 'DUPLICATE' }, authResult.requestId);
      }
      if (prismaError.code === 'P2025') {
        return createErrorResponse('Record not found', 404, { code: 'NOT_FOUND' }, authResult.requestId);
      }
    }
    
    return createErrorResponse(
      'Failed to create tasks',
      500,
      { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      authResult.requestId
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
