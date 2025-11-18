import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

// GET /api/posts/[id]/like - Check if user liked the post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: user.id,
        },
      },
    })

    return Response.json({ isLiked: !!like })
  } catch (error) {
    console.error('[v0] Check like error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/like - Like a post
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Create like
    await prisma.like.create({
      data: {
        postId: id,
        userId: user.id,
      },
    })

    return Response.json({ message: 'Post liked successfully' })
  } catch (error) {
    console.error('[v0] Like post error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
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

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: id,
          userId: user.id,
        },
      },
    })

    return Response.json({ message: 'Post unliked successfully' })
  } catch (error) {
    console.error('[v0] Unlike post error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
