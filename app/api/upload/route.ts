import { NextRequest } from 'next/server'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

// POST /api/upload - Handle image uploads via Cloudinary
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

    // Upload to Cloudinary using unsigned upload
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', 'blog_uploads')

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    const cloudinaryData = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok || cloudinaryData.error) {
      console.error('Cloudinary error:', cloudinaryData)
      return Response.json(
        { error: cloudinaryData.error?.message || 'Upload failed' },
        { status: 500 }
      )
    }

    return Response.json({ url: cloudinaryData.secure_url })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
