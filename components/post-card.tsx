
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Heart, Trash2 } from 'lucide-react'
import LikeButton from './like-button'
import { Button } from './ui/button'
import { useAuth } from '@/lib/auth-context'
import { useState } from 'react'

interface PostCardProps {
  post: {
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
  onDelete?: () => void
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user, token } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!token || !confirm('Are you sure you want to delete this post?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        onDelete?.()
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white to-slate-50/30 backdrop-blur-sm border border-slate-200">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="flex-1">
            <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.image || undefined} alt={post.author.name || 'Author'} />
                <AvatarFallback>{post.author.name?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{post.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.publishedAt || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>

            <Link href={`/post/${post.slug}`}>
              <h2 className="text-2xl font-serif font-bold mb-2 hover:underline text-balance">
                {post.title}
              </h2>
            </Link>

            {post.excerpt && (
              <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tagItem) => (
                  <Link
                    key={tagItem.tag.id}
                    href={`/tag/${tagItem.tag.slug}`}
                    className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-slate-600 to-gray-700 text-white hover:from-slate-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {tagItem.tag.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.readTime && (
                    <span>{post.readTime} min read</span>
                  )}
                  <LikeButton postId={post.id} initialCount={post._count.likes} />
                  <Link href={`/post/${post.slug}#comments`}>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      {post._count.comments}
                    </Button>
                  </Link>
                </div>
                
                {user && user.id === post.author.id && (
                  <Button
                    onClick={handleDelete}
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {post.coverImage && (
            <div className="relative w-full md:w-48 h-48 md:h-32 flex-shrink-0">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover rounded"
                unoptimized={post.coverImage.includes('cloudinary.com')}
                onLoad={() => console.log('Image loaded successfully:', post.coverImage)}
                onError={(e) => {
                  console.error('Image failed to load:', post.coverImage)
                  e.currentTarget.src = '/placeholder.svg'
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
