import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'
import { z } from 'zod'

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            _count: {
              select: {
                followers: true,
                posts: true,
              },
            },
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
    })

    if (!post) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if post is published or user is the author
    if (!post.published) {
      const user = await getAuthUser(request)
      if (!user || user.id !== post.authorId) {
        return Response.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
    }

    return Response.json({ post })
  } catch (error) {
    console.error('[v0] Get post error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update a post
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
    
    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== user.id) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = updatePostSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, content, excerpt, coverImage, published, tags } = validation.data

    // Calculate read time if content is updated
    let readTime = existingPost.readTime
    if (content) {
      const wordCount = content.split(/\s+/).length
      readTime = Math.ceil(wordCount / 200)
    }

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        coverImage: coverImage === '' ? null : coverImage,
        published,
        publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
        readTime,
        tags: tags ? {
          deleteMany: {},
          create: await Promise.all(
            tags.map(async (tagName) => {
              const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
              const tag = await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name: tagName, slug: tagSlug },
              })
              return { tagId: tag.id }
            })
          ),
        } : undefined,
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
      },
    })

    return Response.json({ post })
  } catch (error) {
    console.error('[v0] Update post error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete a post
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
    
    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== user.id) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete post
    await prisma.post.delete({
      where: { id },
    })

    return Response.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('[v0] Delete post error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
