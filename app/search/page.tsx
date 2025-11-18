'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Users, Hash } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/post-card'

interface SearchResults {
  posts: any[]
  users: any[]
  tags: any[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    users: [],
    tags: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults({ posts: [], users: [], tags: [] })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const totalResults = results.posts.length + results.users.length + results.tags.length

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-6">Search</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for stories, people, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
              autoFocus
            />
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : query.trim().length < 2 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Enter at least 2 characters to search</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found for "{query}"</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="posts">
                Stories ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                People ({results.users.length})
              </TabsTrigger>
              <TabsTrigger value="tags">
                Tags ({results.tags.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-8">
              {results.posts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold mb-4">Stories</h2>
                  <div className="space-y-6">
                    {results.posts.slice(0, 3).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {results.users.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold mb-4">People</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.users.slice(0, 4).map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </section>
              )}

              {results.tags.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-3">
                    {results.tags.slice(0, 10).map((tag) => (
                      <TagCard key={tag.id} tag={tag} />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              {results.posts.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No stories found</p>
              ) : (
                <div className="space-y-6">
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              {results.users.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No people found</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tags" className="mt-6">
              {results.tags.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No tags found</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {results.tags.map((tag) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}

function UserCard({ user }: { user: any }) {
  return (
    <Link href={`/profile/${user.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{user.name}</h3>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {user.bio}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{user._count.posts} posts</span>
                <span>{user._count.followers} followers</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function TagCard({ tag }: { tag: any }) {
  return (
    <Link href={`/tag/${tag.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{tag.name}</h3>
            <p className="text-xs text-muted-foreground">
              {tag._count.posts} {tag._count.posts === 1 ? 'story' : 'stories'}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
