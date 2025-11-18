import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

// POST /api/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params
    
    if (user.id === id) {
      return Response.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: id,
      },
    })

    return Response.json({ message: 'Successfully followed user' })
  } catch (error) {
    console.error('[v0] Follow user error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: id,
        },
      },
    })

    return Response.json({ message: 'Successfully unfollowed user' })
  } catch (error) {
    console.error('[v0] Unfollow user error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
