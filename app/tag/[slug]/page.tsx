'use client'

import { use, useEffect, useState } from 'react'
import PostCard from '@/components/post-card'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string | null
  readTime: number | null
  author: {
    id: string
    name: string | null
    image: string | null
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
  _count: {
    comments: number
    likes: number
  }
}

export default function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [posts, setPosts] = useState<Post[]>([])
  const [tagName, setTagName] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [slug, page])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts?tag=${slug}&page=${page}&limit=10`)
      const data = await response.json()

      if (page === 1) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }

      if (data.posts.length > 0 && data.posts[0].tags.length > 0) {
        const tag = data.posts[0].tags.find((t: any) => t.tag.slug === slug)
        if (tag) setTagName(tag.tag.name)
      }

      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
            {tagName || slug}
          </h1>
          <p className="text-muted-foreground">
            Stories tagged with {tagName || slug}
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found with this tag</p>
            </div>
          )}

          {!isLoading && hasMore && (
            <div className="text-center py-8">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
