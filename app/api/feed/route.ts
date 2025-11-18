import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

// GET /api/feed - Get personalized feed for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get posts from authors the user follows
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          authorId: {
            in: followingIds,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          published: true,
          authorId: {
            in: followingIds,
          },
        },
      }),
    ])

    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[v0] Get feed error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
