import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="bg-gray-400 border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 text-balance">
            Stay curious.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <Link href="/explore">
            <Button size="lg" className="rounded-full text-base px-8">
              Start reading
            </Button>
          </Link>
        </div>
      </section>
<section className=" bg-gray-200 py-20">
        <div className="flex space-x-10 container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Diverse perspectives</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore millions of stories from a global community of writers, thinkers, and experts.
              </p>
            </div>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Connect with writers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Follow your favorite authors and engage with a community of passionate readers.
              </p>
            </div>

          </div>
        
      </section>
    </main>
  )
}
