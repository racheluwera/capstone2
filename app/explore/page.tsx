'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import PostCard from '@/components/post-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

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

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function ExplorePage() {
  const { token } = useAuth()
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [trendingTags, setTrendingTags] = useState<Tag[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLatestPosts()
    fetchTrendingTags()
  }, [page])

  useEffect(() => {
    if (token) {
      fetchFeedPosts()
    }
  }, [token])

  const fetchLatestPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts?page=${page}&limit=10`)
      const data = await response.json()

      if (page === 1) {
        setLatestPosts(data.posts)
      } else {
        setLatestPosts(prev => [...prev, ...data.posts])
      }

      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFeedPosts = async () => {
    try {
      const response = await fetch('/api/feed?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setFeedPosts(data.posts)
    } catch (error) {
      console.error('Failed to fetch feed:', error)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch('/api/tags?limit=10')
      const data = await response.json()
      setTrendingTags(data.tags)
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8">
              Explore Stories
            </h1>

            <Tabs defaultValue={token && feedPosts.length > 0 ? 'following' : 'latest'} className="w-full">
              <TabsList className="mb-8">
                {token && feedPosts.length > 0 && (
                  <TabsTrigger value="following">Following</TabsTrigger>
                )}
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>

              {token && feedPosts.length > 0 && (
                <TabsContent value="following">
                  <div className="space-y-8">
                    {feedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    
                    {feedPosts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                          No posts from authors you follow yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Start following authors to see their posts here
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="latest">
                <div className="space-y-8">
                  {latestPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  {isLoading && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  )}

                  {!isLoading && latestPosts.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No posts found</p>
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
              </TabsContent>

              <TabsContent value="trending">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Trending posts based on engagement will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              

              {!token && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Join Medium</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign up to discover stories from writers on any topic.
                    </p>
                    <Link href="/signup">
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
