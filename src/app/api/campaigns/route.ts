import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeInput, checkRateLimit, validatePlatformUrl, sanitizeUrl } from '@/lib/auth'
import { requireAuth, createSuccessResponse, createErrorResponse, createTimer, logAccess, getUserId, isValidCuid } from '@/lib/api-utils'
import { logDataEvent, logSecurityEvent } from '@/lib/audit-log'

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'twitter', 'facebook'], { 
    required_error: 'Platform is required' 
  }),
  serviceType: z.enum([
    'views', 'subscribers', 'likes', 'comments', 'followers', 
    'reels_views', 'story_views', 'shares', 'retweets'
  ], { required_error: 'Service type is required' }),
  targetUrl: z.string().min(1, 'Target URL is required'),
  targetId: z.string().min(1).max(100, 'Target ID must be 1-100 characters'),
  quantity: z.coerce.number().int().min(100).max(1000000).default(1000),
  speed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  geoTarget: z.string().max(50).optional(),
  dailyLimit: z.coerce.number().int().positive().max(10000).optional(),
})

// Rate limit config for campaign creation
const CAMPAIGN_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const CAMPAIGN_MAX_ATTEMPTS = 20 // Max campaigns per user per hour

// Platform-specific URL patterns (same as tasks)
const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  instagram: /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/.+/i,
  tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+/i,
  twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/i,
  facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i,
}

/**
 * Validate URL against platform-specific patterns
 */
function isValidPlatformUrl(url: string, platform: string): boolean {
  const pattern = PLATFORM_URL_PATTERNS[platform]
  if (!pattern) return false
  return pattern.test(url)
}

// GET /api/campaigns - Get all campaigns (or filter by user)
export async function GET(request: NextRequest) {
  const timer = createTimer()
  
  // Optional auth - allows public viewing of campaigns with enhanced data for authenticated users
  const authResult = await requireAuth(request)
  let userId: string | undefined
  
  // If not authenticated, still allow access but with limited functionality
  if (!authResult.authenticated) {
    // Continue without auth for GET requests (public endpoint)
    // But check if this should be auth-required based on query params
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    
    // If requesting specific user's campaigns, require auth
    if (requestedUserId) {
      return authResult.errorResponse!
    }
  } else {
    userId = authResult.session?.userId
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId') || userId
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    
    // Validate userId format if provided
    if (requestedUserId && !isValidCuid(requestedUserId)) {
      return createErrorResponse(
        'Invalid user ID format',
        400,
        { code: 'INVALID_USER_ID' },
        authResult.requestId
      )
    }
    
    // Build where clause with type safety
    const where: Record<string, unknown> = {}
    if (requestedUserId) where.userId = requestedUserId
    if (status) {
      const validStatuses = ['pending', 'active', 'paused', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return createErrorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          400,
          { code: 'INVALID_STATUS' },
          authResult.requestId
        )
      }
      where.status = status
    }
    if (platform) {
      const validPlatforms = Object.keys(PLATFORM_URL_PATTERNS)
      if (!validPlatforms.includes(platform)) {
        return createErrorResponse(
          `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
          400,
          { code: 'INVALID_PLATFORM' },
          authResult.requestId
        )
      }
      where.platform = platform
    }
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    
    const [campaigns, totalCount] = await Promise.all([
      db.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: { tasks: true }
          }
        }
      }),
      db.campaign.count({ where })
    ])
    
    const response = createSuccessResponse(
      { 
        campaigns,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      },
      200,
      undefined,
      authResult.requestId
    )
    
    // Log access
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { count: campaigns.length }
    })
    
    return response
    
  } catch (error) {
    console.error('[Campaigns API] Error fetching campaigns:', error)
    
    return createErrorResponse(
      'Internal server error',
      500,
      { code: 'INTERNAL_ERROR' },
      authResult.requestId
    )
  }
}

// POST /api/campaigns - Create a new campaign (REQUIRES AUTHENTICATION)
export async function POST(request: NextRequest) {
  const timer = createTimer()
  
  // REQUIRE authentication for creating campaigns
  const authResult = await requireAuth(request)
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!
  }
  
  const userId = authResult.session!.userId
  
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = createCampaignSchema.safeParse(body)
    
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        { 
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors 
        },
        authResult.requestId
      )
    }
    
    const validatedData = validationResult.data
    
    // Rate limiting per user
    const rateLimitResult = checkRateLimit(
      `campaign:create:${userId}`,
      CAMPAIGN_WINDOW_MS,
      CAMPAIGN_MAX_ATTEMPTS
    )
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        action: 'rate_limit_exceeded',
        severity: 'warning',
        userId,
        requestId: authResult.requestId,
        details: { endpoint: 'POST /api/campaigns', maxAttempts: CAMPAIGN_MAX_ATTEMPTS },
        request,
      })
      
      return createErrorResponse(
        'Too many campaigns created. Please wait before creating more.',
        429,
        { code: 'RATE_LIMITED', retryAfter: rateLimitResult.retryAfter },
        authResult.requestId
      )
    }
    
    // Sanitize inputs
    const sanitizedTargetId = sanitizeInput(validatedData.targetId, 100)
    const sanitizedGeoTarget = validatedData.geoTarget ? sanitizeInput(validatedData.geoTarget, 50) : null
    
    // Validate and sanitize URL
    const sanitizedUrl = sanitizeUrl(validatedData.targetUrl)
    if (!isValidPlatformUrl(sanitizedUrl, validatedData.platform)) {
      return createErrorResponse(
        `Invalid ${validatedData.platform} URL. Please provide a valid ${validatedData.platform} link.`,
        400,
        { code: 'INVALID_URL' },
        authResult.requestId
      )
    }
    
    // Use transaction to prevent race condition on credits
    const result = await db.$transaction(async (tx) => {
      // Get user WITHIN transaction (locks row)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          credits: true,
          isActive: true
        }
      })
      
      if (!user) {
        throw new Error('USER_NOT_FOUND')
      }
      
      if (!user.isActive) {
        throw new Error('ACCOUNT_INACTIVE')
      }
      
      // Calculate credits needed (simple formula: quantity / 100)
      const creditsNeeded = Math.ceil(validatedData.quantity / 100)
      
      if (user.credits < creditsNeeded) {
        throw new Error(`INSUFFICIENT_CREDITS:${creditsNeeded}:${user.credits}`)
      }
      
      // Deduct credits first (atomic operation within transaction)
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: creditsNeeded },
          totalSpent: { increment: creditsNeeded }
        }
      })
      
      // Then create campaign
      const campaign = await tx.campaign.create({
        data: {
          userId,
          platform: validatedData.platform,
          serviceType: validatedData.serviceType,
          targetUrl: sanitizedUrl,
          targetId: sanitizedTargetId,
          quantity: validatedData.quantity,
          speed: validatedData.speed,
          geoTarget: sanitizedGeoTarget,
          dailyLimit: validatedData.dailyLimit,
          creditsSpent: creditsNeeded,
          status: 'pending',
        }
      })
      
      return { campaign, creditsNeeded, remainingCredits: user.credits - creditsNeeded }
    })
    
    // Log successful creation
    logDataEvent({
      action: 'create',
      entity: 'campaign',
      entityId: result.campaign.id,
      userId,
      success: true,
      requestId: authResult.requestId,
      details: {
        platform: result.campaign.platform,
        serviceType: result.campaign.serviceType,
        quantity: result.campaign.quantity,
        creditsSpent: result.creditsNeeded,
      },
      request,
    })
    
    const response = createSuccessResponse(
      {
        message: 'Campaign created successfully',
        campaign: result.campaign,
        creditsDeducted: result.creditsNeeded,
        remainingCredits: result.remainingCredits
      },
      201,
      undefined,
      authResult.requestId
    )
    
    logAccess({
      request,
      statusCode: 201,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { campaignId: result.campaign.id }
    })
    
    return response
    
  } catch (error) {
    console.error('[Campaigns API] Error creating campaign:', error)
    
    // Log failed attempt
    logDataEvent({
      action: 'create',
      entity: 'campaign',
      userId,
      success: false,
      requestId: authResult.requestId,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      request,
    })
    
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'Validation failed',
        400,
        { code: 'VALIDATION_ERROR', details: error.errors },
        authResult.requestId
      )
    }
    
    // Handle specific transaction errors
    if (error instanceof Error) {
      const errorMessage = error.message
      
      if (errorMessage === 'USER_NOT_FOUND') {
        return createErrorResponse('User not found', 404, { code: 'USER_NOT_FOUND' }, authResult.requestId)
      }
      
      if (errorMessage === 'ACCOUNT_INACTIVE') {
        return createErrorResponse('Account is deactivated', 403, { code: 'ACCOUNT_INACTIVE' }, authResult.requestId)
      }
      
      if (errorMessage.startsWith('INSUFFICIENT_CREDITS')) {
        const [, needed, current] = errorMessage.split(':')
        return createErrorResponse(
          'Insufficient credits', 
          400,
          { 
            code: 'INSUFFICIENT_CREDITS',
            required: parseInt(needed), 
            current: parseInt(current),
            shortfall: parseInt(needed) - parseInt(current)
          },
          authResult.requestId
        )
      }
    }
    
    return createErrorResponse(
      'Internal server error',
      500,
      { code: 'INTERNAL_ERROR' },
      authResult.requestId
    )
  }
}
