import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/utils/auth-helper'

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if current user is following this user
    const currentUser = await getAuthUser(request)
    let isFollowing = false
    
    if (currentUser) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: id,
          },
        },
      })
      isFollowing = !!follow
    }

    return Response.json({ user: { ...user, isFollowing } })
  } catch (error) {
    console.error('[v0] Get user error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
