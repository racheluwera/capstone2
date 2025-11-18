import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, TrendingUp, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-24 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-6 text-balance">
            Stay curious.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <Link href="/login">
            <Button size="lg" className="rounded-full text-base px-8">
              Start reading
            </Button>
          </Link>
        </div>
      </section>

    </main>
  )
}
