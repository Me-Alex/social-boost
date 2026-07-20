import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sanitizeInput, isValidEmail, checkRateLimit } from '@/lib/auth'
import { requireAuth, createSuccessResponse, createErrorResponse, createTimer, logAccess } from '@/lib/api-utils'
import { logDataEvent, logSecurityEvent } from '@/lib/audit-log'

// Validation schema for user update (userId no longer needed - comes from auth)
const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
})

// GET /api/user - Get user profile and stats (REQUIRES AUTHENTICATION)
// Now uses auth session to identify user instead of query parameter
export async function GET(request: NextRequest) {
  const timer = createTimer()
  
  // REQUIRE authentication
  const authResult = await requireAuth(request)
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!
  }
  
  const userId = authResult.session!.userId
  
  try {
    // Rate limit for user lookups
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = checkRateLimit(`user:get:${userId}`, 60 * 1000, 100)
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        action: 'rate_limit_exceeded',
        severity: 'warning',
        userId,
        requestId: authResult.requestId,
        details: { endpoint: 'GET /api/user' },
        request,
      })
      
      return createErrorResponse(
        'Too many requests',
        429,
        { code: 'RATE_LIMITED' },
        authResult.requestId
      )
    }
    
    // Get user with campaign stats (using authenticated userId)
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
      return createErrorResponse(
        'User not found',
        404,
        { code: 'USER_NOT_FOUND' },
        authResult.requestId
      )
    }
    
    // Calculate stats
    const totalCampaigns = user.campaigns.length
    const activeCampaigns = user.campaigns.filter(c => c.status === 'active').length
    const completedCampaigns = user.campaigns.filter(c => c.status === 'completed').length
    const totalCreditsSpent = user.campaigns.reduce((sum, c) => sum + c.creditsSpent, 0)
    const totalEngagementDelivered = user.campaigns.reduce((sum, c) => sum + c.completedCount, 0)
    
    const response = createSuccessResponse({
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
    }, 200, undefined, authResult.requestId)
    
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
    })
    
    return response
    
  } catch (error) {
    console.error('[User API] Error fetching user:', error)
    
    return createErrorResponse(
      'Internal server error',
      500,
      { code: 'INTERNAL_ERROR' },
      authResult.requestId
    )
  }
}

// PUT /api/user - Update user profile (REQUIRES AUTHENTICATION)
export async function PUT(request: NextRequest) {
  const timer = createTimer()
  
  // REQUIRE authentication
  const authResult = await requireAuth(request)
  
  if (!authResult.authenticated) {
    return authResult.errorResponse!
  }
  
  const userId = authResult.session!.userId
  
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = updateUserSchema.safeParse(body)
    
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
    
    const { name, email } = validationResult.data
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })
    
    if (!existingUser) {
      return createErrorResponse(
        'User not found',
        404,
        { code: 'USER_NOT_FOUND' },
        authResult.requestId
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
        return createErrorResponse(
          'Invalid email format',
          400,
          { code: 'INVALID_EMAIL' },
          authResult.requestId
        )
      }
      
      // Check it's not taken
      const normalizedEmail = email.toLowerCase()
      const emailTaken = await db.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true }
      })
      
      if (emailTaken) {
        return createErrorResponse(
          'Email is already in use by another account',
          409,
          { code: 'EMAIL_TAKEN' },
          authResult.requestId
        )
      }
      
      updateData.email = normalizedEmail
    }
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return createSuccessResponse(
        { message: 'No changes to update', user: existingUser },
        200,
        undefined,
        authResult.requestId
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
    
    // Log successful update
    logDataEvent({
      action: 'update',
      entity: 'user',
      entityId: userId,
      userId,
      success: true,
      requestId: authResult.requestId,
      details: { fieldsUpdated: Object.keys(updateData) },
      request,
    })
    
    const response = createSuccessResponse({
      message: 'Profile updated successfully',
      user: updatedUser
    }, 200, undefined, authResult.requestId)
    
    logAccess({
      request,
      statusCode: 200,
      durationMs: timer.elapsed(),
      userId,
      requestId: authResult.requestId,
      details: { fieldsUpdated: Object.keys(updateData) }
    })
    
    return response
    
  } catch (error) {
    console.error('[User API] Error updating user:', error)
    
    // Log failed attempt
    logDataEvent({
      action: 'update',
      entity: 'user',
      entityId: userId,
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
    
    return createErrorResponse(
      'Internal server error',
      500,
      { code: 'INTERNAL_ERROR' },
      authResult.requestId
    )
  }
}
