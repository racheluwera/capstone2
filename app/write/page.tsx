'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichTextEditor from '@/components/rich-text-editor'
import { Save, Eye, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function WriteContent() {
  const { user, token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [excerpt, setExcerpt] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (editId) {
      fetchPost(editId)
    }
  }, [user, editId, router])

  const fetchPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const post = data.post
        setTitle(post.title)
        setContent(post.content)
        setCoverImage(post.coverImage || '')
        setExcerpt(post.excerpt || '')

      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    }
  }

 const handleSaveDraft = async () => {
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const postData = {
        title,
        content,
        excerpt,
        coverImage,
        published: false,
        tags: [],
      }

      const url = editId ? `/api/posts/${editId}` : '/api/posts'
      const method = editId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save draft')
      }

      router.push('/my-stories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsLoading(false)
    }
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'blog_uploads')

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dowch4rmk/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      )
      
      const data = await response.json()
      
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Upload failed')
      }
      
      setCoverImage(data.secure_url)
      setError('✅ Image uploaded successfully!')
      setTimeout(() => setError(''), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(`❌ ${error instanceof Error ? error.message : 'Failed to upload image'}`)
    } finally {
      setUploading(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const postData = {
        title,
        content,
        excerpt,
        coverImage,
        published: true,
        tags: [],
      }

      console.log('Publishing post with coverImage:', coverImage)

      const url = editId ? `/api/posts/${editId}` : '/api/posts'
      const method = editId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to publish post')
      }

      const data = await response.json()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post')
    } finally {
      setIsLoading(false)
      setShowPublishDialog(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-100 min-h-screen">
      <div className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif font-semibold">
            {editId ? 'Edit Story' : 'Write a Story'}
          </h1>
          <div className="flex items-center gap-3">
             <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}

            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            
              <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              size="sm"
              onClick={() => setShowPublishDialog(true)}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <Alert variant={error.startsWith('✅') ? 'default' : 'destructive'} className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-5xl font-serif font-bold border-0 px-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Tell your story..."
          />
        </div>
      </div>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Publishing Settings</DialogTitle>
            <DialogDescription>
              Add details to help readers discover your story
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Story Preview (Excerpt)</Label>
              <Input
                id="excerpt"
                placeholder="Write a brief description..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                This will appear in previews and search results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              {coverImage && (
                <div className="mt-3">
                  <img 
                    src={coverImage} 
                    alt="Cover preview" 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCoverImage('')}
                    className="mt-2"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isLoading} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              {isLoading ? 'Publishing...' : 'Publish Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </main>
    }>
      <WriteContent />
    </Suspense>
  )
}
