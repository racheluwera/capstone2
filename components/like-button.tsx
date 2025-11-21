'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from './ui/button'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialCount?: number
}

export default function LikeButton({ postId, initialCount = 0 }: LikeButtonProps) {
  const { token } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!token || isLoading) return

    setIsLoading(true)
    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/posts/${postId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-1 text-muted-foreground"
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      {likeCount}
    </Button>
  )
}