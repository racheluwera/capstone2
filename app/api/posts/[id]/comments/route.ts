import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
  parentId: z.string().optional(),
})

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get top-level comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
        parentId: null, // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return Response.json({ comments })
  } catch (error) {
    console.error('[v0] Get comments error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/posts/[id]/comments - Create a comment
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
    const body = await request.json()

    // Validate input
    const validation = createCommentSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content, parentId } = validation.data

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

    // If replying to a comment, verify parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.postId !== id) {
        return Response.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
        authorId: user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return Response.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('[v0] Create comment error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
