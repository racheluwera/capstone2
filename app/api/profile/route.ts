import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal('')),
})

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    // Validate input
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, bio, image } = validation.data

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        image: image === '' ? null : image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    })

    return Response.json({ user: updatedUser })
  } catch (error) {
    console.error('[v0] Update profile error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
