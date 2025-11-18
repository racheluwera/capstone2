import { NextRequest } from 'next/server'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

// POST /api/upload - Handle image uploads
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return Response.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // In a real application, you would upload to cloud storage (Cloudinary, S3, etc.)
    // For now, we'll return a placeholder URL
    const mockUrl = `/placeholder.svg?height=600&width=1200&query=uploaded-image-${Date.now()}`

    return Response.json({ url: mockUrl })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
