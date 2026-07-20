import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/user - Get user profile and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id') || searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Get user with campaign stats
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        campaigns: {
          orderBy: { createdAt: 'desc' }
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
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      stats: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalCreditsSpent,
        totalEngagementDelivered
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
    const { userId, name, email } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // If updating email, check it's not taken
    if (email && email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email }
      })
      
      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        )
      }
    }
    
    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      }
    })
    
    const { password: _, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
