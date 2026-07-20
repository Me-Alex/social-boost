import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { 
  hashPassword, 
  sanitizeInput, 
  isValidEmail,
  validatePasswordStrength,
  checkRateLimit 
} from '@/lib/auth'

// Validation schema with stricter requirements
const registerSchema = z.object({
  email: z.string().refine(
    (email) => isValidEmail(email),
    { message: 'Invalid email format' }
  ).transform(email => email.toLowerCase()),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
})

// Rate limit config for registration
const REGISTER_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const REGISTER_MAX_ATTEMPTS = 5 // Max registrations per IP per window

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(
      `register:${clientIp}`,
      REGISTER_WINDOW_MS,
      REGISTER_MAX_ATTEMPTS
    )
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(rateLimitResult.retryAfter),
            'RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    
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
    
    // Additional password strength validation
    const passwordCheck = validatePasswordStrength(validatedData.password)
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet security requirements',
          details: passwordCheck.errors 
        },
        { status: 400 }
      )
    }
    
    // Sanitize name input
    const sanitizedName = sanitizeInput(validatedData.name, 50)
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        { 
          error: 'If this email is not registered, you will receive a confirmation. Please check your inbox or try signing in.' 
        },
        { status: 200 } // Return 200 to not reveal existence
      )
    }
    
    // Hash the password before storing
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create new user with hashed password
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        name: sanitizedName,
        password: hashedPassword,
        credits: 500, // Bonus credits for new users
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        plan: true,
        isActive: true,
        createdAt: true
      }
    })
    
    // Return user (password never included due to select)
    return NextResponse.json({
      message: 'Account created successfully',
      user,
      rateLimit: {
        remaining: rateLimitResult.remaining - 1
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific errors
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
