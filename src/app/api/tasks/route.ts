import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

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

// Validation schemas
const taskQuerySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'twitter', 'facebook']).optional(),
  status: z.enum(['pending', 'claimed', 'in_progress', 'completed', 'verified', 'failed', 'cancelled', 'available', 'my-created', 'my-completing']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20)
});

const createTaskSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  campaignId: z.string().optional(),
  platform: z.enum(ALLOWED_PLATFORMS, { required_error: 'platform is required' }),
  serviceType: z.enum(ALLOWED_SERVICE_TYPES, { required_error: 'serviceType is required' }),
  targetUrl: z.string().min(1, 'targetUrl is required'), // Will be validated further below
  targetId: z.string().min(1).max(100, 'targetId must be 1-100 characters'),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  creditsPerTask: z.coerce.number().int().min(1).max(10).default(1)
});

// Rate limiting store (in-memory for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // requests per window

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// GET /api/tasks - List available tasks or user's tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const validationResult = taskQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { userId, platform, status, limit } = validationResult.data;
    
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkRateLimit(`tasks:get:${clientIp}`);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
      );
    }
    
    // Build filter
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
    
    if (platform) {
      where.platform = platform;
    }
    
    const [tasks, counts] = await Promise.all([
      db.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          creator: { select: { id: true, name: true, email: true } },
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
    
    return NextResponse.json({
      success: true,
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
    });
    
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = createTaskSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }
    
    const { userId, campaignId, platform, serviceType, targetUrl, targetId, quantity, creditsPerTask } = validationResult.data;
    
    // Validate and sanitize URL for specific platform
    const sanitizedUrl = sanitizeUrl(targetUrl);
    if (!validatePlatformUrl(sanitizedUrl, platform)) {
      return NextResponse.json(
        { error: `Invalid ${platform} URL. Please provide a valid ${platform} link.` },
        { status: 400 }
      );
    }
    
    // Sanitize targetId
    const sanitizedTargetId = sanitizeString(targetId, 100);
    
    // Rate limiting for task creation (stricter)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = checkRateLimit(`tasks:create:${userId}:${clientIp}`);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many tasks created. Please wait before creating more.', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429 }
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
    
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is suspended' },
        { status: 403 }
      );
    }
    
    const totalCost = quantity * creditsPerTask;
    
    if (user.credits < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: totalCost, current: user.credits, shortfall: totalCost - user.credits },
        { status: 400 }
      );
    }
    
    // Verify campaign exists if provided
    if (campaignId) {
      const campaign = await db.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      if (campaign.userId !== userId) {
        return NextResponse.json(
          { error: 'Campaign does not belong to this user' },
          { status: 403 }
        );
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
    
    return NextResponse.json({
      success: true,
      quantity,
      totalCost,
      creditsRemaining: result.updatedUser.credits,
      tasksCreated: result.tasksCreated,
      message: `${quantity} task(s) created successfully`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Tasks POST error:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: Record<string, unknown> };
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A unique constraint was violated' },
          { status: 409 }
        );
      }
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Record not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create tasks', message: error instanceof Error ? error.message : 'Unknown error' },
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
