import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  platform: z.enum(['youtube', 'instagram'], { required_error: 'Platform is required' }),
  serviceType: z.enum(['views', 'subscribers', 'likes', 'comments', 'followers', 'reels_views', 'story_views']),
  targetUrl: z.string().url('Invalid URL').min(1, 'Target URL is required'),
  targetId: z.string().min(1, 'Target ID is required'),
  quantity: z.number().int().min(100).max(1000000).default(1000),
  speed: z.enum(['slow', 'normal', 'fast']).default('normal'),
  geoTarget: z.string().optional(),
  dailyLimit: z.number().int().positive().optional(),
})

// GET /api/campaigns - Get all campaigns (or filter by user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    
    // Build where clause
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status
    if (platform) where.platform = platform
    
    const campaigns = await db.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })
    
    return NextResponse.json({ campaigns })
    
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
    const validatedData = createCampaignSchema.parse(body)
    
    // Check if user exists and has enough credits
    const user = await db.user.findUnique({
      where: { id: validatedData.userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate credits needed (simple formula: quantity / 100)
    const creditsNeeded = Math.ceil(validatedData.quantity / 100)
    
    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditsNeeded} credits but have ${user.credits}.` },
        { status: 400 }
      )
    }
    
    // Create campaign
    const campaign = await db.campaign.create({
      data: {
        userId: validatedData.userId,
        platform: validatedData.platform,
        serviceType: validatedData.serviceType,
        targetUrl: validatedData.targetUrl,
        targetId: validatedData.targetId,
        quantity: validatedData.quantity,
        speed: validatedData.speed,
        geoTarget: validatedData.geoTarget,
        dailyLimit: validatedData.dailyLimit,
        creditsSpent: creditsNeeded,
        status: 'pending',
      }
    })
    
    // Deduct credits from user
    await db.user.update({
      where: { id: validatedData.userId },
      data: {
        credits: user.credits - creditsNeeded
      }
    })
    
    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
