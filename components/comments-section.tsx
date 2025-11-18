'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { MessageCircle, CornerDownRight, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

interface CommentsSectionProps {
  postId: string
  initialCount: number
}

export default function CommentsSection({ postId, initialCount }: CommentsSectionProps) {
  const { user, token } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()
      setComments(data.comments)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!token || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        Responses ({comments.length})
      </h2>

      {user ? (
        <Card className="p-4 mb-8">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What are your thoughts?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3"
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="rounded-full"
                >
                  {isSubmitting ? 'Posting...' : 'Respond'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-8 text-center">
          <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No responses yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onUpdate={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  postId,
  onUpdate,
  isReply = false,
}: {
  comment: Comment
  postId: string
  onUpdate: () => void
  isReply?: boolean
}) {
  const { user, token } = useAuth()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReply = async () => {
    if (!token || !replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent,
          parentId: comment.id,
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setIsReplying(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!token || !editContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to edit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  return (
    <div className={isReply ? 'ml-12' : ''}>
      <Card className="p-4">
        <div className="flex gap-3">
          <Link href={`/profile/${comment.author.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || 'User'} />
              <AvatarFallback>{comment.author.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/profile/${comment.author.id}`}>
                <span className="font-medium hover:underline">{comment.author.name}</span>
              </Link>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    disabled={isSubmitting}
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed mb-3">{comment.content}</p>

                <div className="flex items-center gap-4">
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsReplying(!isReplying)}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <CornerDownRight className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  {user?.id === comment.author.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {isReplying && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    size="sm"
                  >
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsReplying(false)
                      setReplyContent('')
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onUpdate={onUpdate}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
