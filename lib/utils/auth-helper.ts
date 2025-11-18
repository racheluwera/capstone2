import { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return getUserFromToken(token)
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
