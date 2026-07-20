import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeInput, isValidEmail, checkRateLimit } from '@/lib/auth'

// Validation schema for user update
const updateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
})

// GET /api/user - Get user profile and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id') || searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required (use ?id= or ?userId=)' },
        { status: 400 }
      )
    }
    
    // Basic format validation for CUID
    if (!/^[a-z0-9]{20,30}$/i.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }
    
    // Rate limit for user lookups
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = checkRateLimit(`user:get:${clientIp}`, 60 * 1000, 100)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    // Get user with campaign stats
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        isActive: true,
        lastActiveAt: true,
        totalEarned: true,
        totalSpent: true,
        tasksCompleted: true,
        tasksCreated: true,
        createdAt: true,
        updatedAt: true,
        campaigns: {
          select: {
            id: true,
            platform: true,
            serviceType: true,
            status: true,
            quantity: true,
            completedCount: true,
            creditsSpent: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Limit campaigns in response
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate stats
    const totalCampaigns = user.campaigns.length
    const activeCampaigns = user.campaigns.filter(c => c.status === 'active').length
    const completedCampaigns = user.campaigns.filter(c => c.status === 'completed').length
    const totalCreditsSpent = user.campaigns.reduce((sum, c) => sum + c.creditsSpent, 0)
    const totalEngagementDelivered = user.campaigns.reduce((sum, c) => sum + c.completedCount, 0)
    
    return NextResponse.json({
      user,
      stats: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalCreditsSpent,
        totalEngagementDelivered,
        creditBalance: user.credits,
        totalEarned: user.totalEarned,
        tasksCompleted: user.tasksCompleted
      }
    })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = updateUserSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const { userId, name, email } = validationResult.data
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Basic format validation for CUID
    if (!/^[a-z0-9]{20,30}$/i.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: Record<string, string> = {}
    
    if (name !== undefined) {
      // Sanitize name input
      updateData.name = sanitizeInput(name, 50)
    }
    
    if (email !== undefined && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      // Validate new email format
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
      
      // Check it's not taken
      const normalizedEmail = email.toLowerCase()
      const emailTaken = await db.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true }
      })
      
      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email is already in use by another account' },
          { status: 409 }
        )
      }
      
      updateData.email = normalizedEmail
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No changes to update', user: existingUser },
        { status: 200 }
      )
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        isActive: true,
        lastActiveAt: true,
        totalEarned: true,
        tasksCompleted: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
