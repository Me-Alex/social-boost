import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeInput, checkRateLimit, validatePlatformUrl, sanitizeUrl } from '@/lib/auth'

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
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
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    
    // Validate userId format if provided
    if (userId && !/^[a-z0-9]{20,30}$/i.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }
    
    // Build where clause with type safety
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) {
      const validStatuses = ['pending', 'active', 'paused', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      where.status = status
    }
    if (platform) {
      const validPlatforms = Object.keys(PLATFORM_URL_PATTERNS)
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json(
          { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
          { status: 400 }
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
              // Don't expose email in list view
            }
          },
          _count: {
            select: { tasks: true }
          }
        }
      }),
      db.campaign.count({ where })
    ])
    
    return NextResponse.json({ 
      campaigns,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = createCampaignSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const validatedData = validationResult.data
    
    // Rate limiting per user
    const rateLimitResult = checkRateLimit(
      `campaign:create:${validatedData.userId}`,
      CAMPAIGN_WINDOW_MS,
      CAMPAIGN_MAX_ATTEMPTS
    )
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many campaigns created. Please wait before creating more.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429,
          headers: { 'Retry-After': String(rateLimitResult.retryAfter) }
        }
      )
    }
    
    // Sanitize inputs
    const sanitizedTargetId = sanitizeInput(validatedData.targetId, 100)
    const sanitizedGeoTarget = validatedData.geoTarget ? sanitizeInput(validatedData.geoTarget, 50) : null
    
    // Validate and sanitize URL
    const sanitizedUrl = sanitizeUrl(validatedData.targetUrl)
    if (!isValidPlatformUrl(sanitizedUrl, validatedData.platform)) {
      return NextResponse.json(
        { 
          error: `Invalid ${validatedData.platform} URL. Please provide a valid ${validatedData.platform} link.` 
        },
        { status: 400 }
      )
    }
    
    // Use transaction to prevent race condition on credits
    const result = await db.$transaction(async (tx) => {
      // Get user WITHIN transaction (locks row)
      const user = await tx.user.findUnique({
        where: { id: validatedData.userId },
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
        where: { id: validatedData.userId },
        data: {
          credits: { decrement: creditsNeeded },
          totalSpent: { increment: creditsNeeded }
        }
      })
      
      // Then create campaign
      const campaign = await tx.campaign.create({
        data: {
          userId: validatedData.userId,
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
    
    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign: result.campaign,
      creditsDeducted: result.creditsNeeded,
      remainingCredits: result.remainingCredits
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle specific transaction errors
    if (error instanceof Error) {
      const errorMessage = error.message
      
      if (errorMessage === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      if (errorMessage === 'ACCOUNT_INACTIVE') {
        return NextResponse.json(
          { error: 'Account is deactivated' },
          { status: 403 }
        )
      }
      
      if (errorMessage.startsWith('INSUFFICIENT_CREDITS')) {
        const [, needed, current] = errorMessage.split(':')
        return NextResponse.json(
          { 
            error: 'Insufficient credits', 
            required: parseInt(needed), 
            current: parseInt(current),
            shortfall: parseInt(needed) - parseInt(current)
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
