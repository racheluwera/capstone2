import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return Response.json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
