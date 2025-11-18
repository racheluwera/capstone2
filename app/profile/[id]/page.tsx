'use client'

import { use, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/post-card'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  createdAt: string
  isFollowing: boolean
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface Post {
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

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user: currentUser, token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchPosts()
  }, [id])

  const fetchProfile = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/users/${id}`, { headers })
      const data = await response.json()
      setProfile(data.user)
      setIsFollowing(data.user.isFollowing)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/users/${id}/posts`)
      const data = await response.json()
      setPosts(data.posts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!token) return

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/users/${id}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        // Refresh profile to update follower count
        fetchProfile()
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === id

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.image || undefined} alt={profile.name || 'User'} />
              <AvatarFallback className="text-2xl">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2">{profile.name}</h1>
                  {profile.bio && (
                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  )}
                </div>

                {!isOwnProfile && currentUser && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowing ? 'outline' : 'default'}
                    className="rounded-full"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}

                {isOwnProfile && (
                  <Link href="/settings">
                    <Button variant="outline" className="rounded-full">
                      Edit profile
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {profile._count.followers} followers
                </div>
                <div>{profile._count.following} following</div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="posts" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Posts ({profile._count.posts})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-8">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No published posts yet</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
