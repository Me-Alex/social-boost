import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { 
  comparePassword, 
  generateToken,
  isValidEmail,
  checkRateLimit 
} from '@/lib/auth'
import { createSession } from '@/lib/auth-middleware'

// Validation schema
const loginSchema = z.object({
  email: z.string().refine(
    (email) => isValidEmail(email),
    { message: 'Invalid email format' }
  ).transform(email => email.toLowerCase()),
  password: z.string().min(1, 'Password is required')
})

// Rate limit config for login (stricter - brute force protection)
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX_ATTEMPTS = 10 // Max attempts per IP per window

// Track failed attempts per email for account lockout
const failedAttempts = new Map<string, { count: number; lockedUntil?: number }>()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(
      `login:${clientIp}`,
      LOGIN_WINDOW_MS,
      LOGIN_MAX_ATTEMPTS
    )
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(rateLimitResult.retryAfter)
          }
        }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = loginSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const { email, password } = validationResult.data
    
    // Check if account is temporarily locked due to failed attempts
    const attemptRecord = failedAttempts.get(email)
    if (attemptRecord && attemptRecord.lockedUntil) {
      if (Date.now() < attemptRecord.lockedUntil) {
        const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 60000)
        return NextResponse.json(
          { 
            error: `Account temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
            lockedUntil: new Date(attemptRecord.lockedUntil).toISOString(),
            retryAfter: Math.ceil((attemptRecord.lockedUntil - Date.now()) / 1000)
          },
          { status: 423 } // Locked
        )
      } else {
        // Lockout expired, reset
        failedAttempts.delete(email)
      }
    }
    
    // Find user by email (exclude sensitive data)
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // Need password for comparison
        credits: true,
        plan: true,
        isActive: true,
        lastActiveAt: true,
        totalEarned: true,
        tasksCompleted: true,
        createdAt: true
      }
    })
    
    // Use generic error message to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Please contact support.' },
        { status: 403 }
      )
    }
    
    // Compare hashed password
    const isPasswordValid = await comparePassword(password, user.password || '')
    
    if (!isPasswordValid) {
      // Record failed attempt
      const currentAttempts = (attemptRecord?.count || 0) + 1
      failedAttempts.set(email, { count: currentAttempts })
      
      // Lock account if too many failures
      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        failedAttempts.set(email, { 
          count: currentAttempts, 
          lockedUntil: Date.now() + LOCKOUT_DURATION_MS 
        })
        
        console.warn(`[Auth] Account locked for email: ${email} after ${currentAttempts} failed attempts`)
        
        return NextResponse.json(
          { 
            error: 'Invalid email or password',
            attemptsRemaining: 0,
            warning: 'Account will be locked after too many failed attempts'
          },
          { status: 401 }
        )
      }
      
      const remaining = MAX_FAILED_ATTEMPTS - currentAttempts
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          attemptsRemaining: remaining,
          ...(remaining <= 2 && { warning: `${remaining} attempts remaining before account lockout` })
        },
        { status: 401 }
      )
    }
    
    // Successful login - clear failed attempts
    failedAttempts.delete(email)
    
    // Generate session token
    const sessionToken = generateToken()
    
    // Create authenticated session
    const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined
    
    createSession(user.id, sessionToken, { ip: clientIp, userAgent })
    
    // Update user's last active timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() }
    })
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token: sessionToken,
      expiresIn: '24h', // Token expiration info for client
      rateLimit: {
        remaining: rateLimitResult.remaining - 1
      }
    }, {
      headers: {
        // Set secure cookie options for production
        // 'Set-Cookie': `token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
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
