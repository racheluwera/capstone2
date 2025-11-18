import { NextRequest } from 'next/server'
import { getAuthUser, unauthorizedResponse } from '@/lib/utils/auth-helper'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return unauthorizedResponse()
    }

    return Response.json({ user })
  } catch (error) {
    console.error('[v0] Get current user error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
