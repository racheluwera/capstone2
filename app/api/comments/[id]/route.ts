import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'
import { z } from 'zod'

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
})

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!existingComment) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== user.id) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = updateCommentSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content } = validation.data

    // Update comment
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
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

    return Response.json({ comment })
  } catch (error) {
    console.error('[v0] Update comment error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comments/[id] - Delete a comment
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

    // Check if comment exists and user is the author
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!existingComment) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== user.id) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will delete replies)
    await prisma.comment.delete({
      where: { id },
    })

    return Response.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('[v0] Delete comment error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
