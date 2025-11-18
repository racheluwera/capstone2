'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PenSquare, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  _count: {
    comments: number
    likes: number
  }
}

export default function MyStoriesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchPosts()
  }, [user, router])

  const fetchPosts = async () => {
    try {
      const [publishedRes, draftsRes] = await Promise.all([
        fetch(`/api/posts?authorId=${user?.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/posts?draft=true`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      const publishedData = await publishedRes.json()
      const draftsData = await draftsRes.json()

      setPosts(publishedData.posts)
      setDrafts(draftsData.posts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif font-bold">Your Stories</h1>
          <Link href="/write">
            <Button className="gap-2">
              <PenSquare className="h-4 w-4" />
              Write a story
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="published" className="w-full">
          <TabsList>
            <TabsTrigger value="published">Published ({posts.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't published any stories yet</p>
                <Link href="/write">
                  <Button>Write your first story</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <StoryCard
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            {drafts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No drafts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((post) => (
                  <StoryCard
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function StoryCard({ post, onDelete }: { post: Post; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={post.published ? `/post/${post.slug}` : '#'}>
              <h2 className="text-2xl font-serif font-bold mb-2 hover:underline">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {post.published ? 'Published' : 'Draft'} on{' '}
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {post.published && (
                <>
                  <span>•</span>
                  <span>{post._count.likes} likes</span>
                  <span>•</span>
                  <span>{post._count.comments} comments</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/write?edit=${post.id}`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
