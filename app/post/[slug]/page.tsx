'use client'

import { use, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import CommentsSection from '@/components/comments-section'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string | null
  readTime: number | null
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    _count: {
      followers: number
      posts: number
    }
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

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { user, token } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts/${slug}`, { headers })
      const data = await response.json()
      
      if (response.ok) {
        setPost(data.post)
        setLikeCount(data.post._count.likes)
        
        if (user) {
          // Check if user liked this post
          const likeResponse = await fetch(`/api/posts/${data.post.id}/like`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          if (likeResponse.ok) {
            const likeData = await likeResponse.json()
            setIsLiked(likeData.isLiked)
          }

          // Check if user follows the author
          const userResponse = await fetch(`/api/users/${data.post.author.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setIsFollowing(userData.user.isFollowing)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!token) return

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/posts/${post?.id}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleFollow = async () => {
    if (!token || !post) return

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${post.author.id}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: post?.title,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const handleDelete = async () => {
    if (!token || !post || !confirm('Are you sure you want to delete this post?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        router.push('/my-stories')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-balance">
          {post.title}
        </h1>

        <div className="flex items-center justify-between mb-8">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.image || undefined} alt={post.author.name || 'Author'} />
              <AvatarFallback>{post.author.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.publishedAt || '').toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })} · {post.readTime} min read
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user && user.id !== post.author.id && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                className="rounded-full"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            
            {user && user.id === post.author.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Post'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 py-4 border-y border-border mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            {post._count.comments}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>

        {post.coverImage && (
          <div className="relative w-full h-96 mb-8">
            <Image
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        )}

        <div 
          className="prose prose-stone prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">
            {post.tags.map((tagItem) => (
              <Link
                key={tagItem.tag.id}
                href={`/tag/${tagItem.tag.slug}`}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm"
              >
                {tagItem.tag.name}
              </Link>
            ))}
          </div>
        )}

        <Separator className="my-12" />

        <div className="flex items-center justify-between p-6 bg-card border border-border rounded-lg">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={post.author.image || undefined} alt={post.author.name || 'Author'} />
              <AvatarFallback className="text-xl">
                {post.author.name?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{post.author.name}</p>
              <p className="text-muted-foreground text-sm mb-1">
                {post.author._count.followers} Followers
              </p>
              {post.author.bio && (
                <p className="text-sm line-clamp-2">{post.author.bio}</p>
              )}
            </div>
          </Link>

          {user && user.id !== post.author.id && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? 'outline' : 'default'}
              className="rounded-full"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <CommentsSection postId={post.id} initialCount={post._count.comments} />
      </article>

      <style jsx global>{`
        .prose h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          line-height: 1.2;
          font-family: Georgia, serif;
        }
        .prose h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          line-height: 1.3;
          font-family: Georgia, serif;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem;
          line-height: 1.4;
          font-family: Georgia, serif;
        }
        .prose p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin: 1rem 0;
        }
        .prose blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1.5rem;
          font-style: italic;
          color: #64748b;
          margin: 1.5rem 0;
        }
        .prose ul, .prose ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .prose li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .prose a {
          color: #0f172a;
          text-decoration: underline;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </main>
  )
}
