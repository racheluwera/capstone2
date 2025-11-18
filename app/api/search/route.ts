import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search - Search for posts, users, and tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, posts, users, tags

    if (!query || query.trim().length < 2) {
      return Response.json({
        posts: [],
        users: [],
        tags: [],
      })
    }

    const searchQuery = query.trim()

    let posts: any[] = []
    let users: any[] = []
    let tags: any[] = []

    if (type === 'all' || type === 'posts') {
      posts = await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { excerpt: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
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
        take: 10,
        orderBy: {
          publishedAt: 'desc',
        },
      })
    }

    if (type === 'all' || type === 'users') {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { bio: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          _count: {
            select: {
              posts: { where: { published: true } },
              followers: true,
            },
          },
        },
        take: 10,
      })
    }

    if (type === 'all' || type === 'tags') {
      tags = await prisma.tag.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { slug: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        take: 10,
      })
    }

    return Response.json({
      posts,
      users,
      tags,
    })
  } catch (error) {
    console.error('[v0] Search error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
