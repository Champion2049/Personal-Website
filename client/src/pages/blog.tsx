import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ArrowUpRight, PenLine } from 'lucide-react';
import { sortedPosts } from '@/lib/blog-data';
import { readingTime } from '@/lib/markdown';
import { useSpotlight } from '@/lib/use-spotlight';

function BlogTopBar() {
  return (
    <nav className="sticky top-0 z-40 px-4 md:px-8 py-4">
      <div className="mx-auto max-w-3xl glass-effect rounded-2xl px-5 py-3 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to portfolio
        </Link>
        <span className="font-mono text-sm font-semibold">chirayu<span className="text-primary">.dev</span></span>
        <span className="hidden sm:inline font-mono text-[0.7rem] tracking-[0.3em] uppercase text-primary/70">// blog</span>
      </div>
    </nav>
  );
}

export default function Blog() {
  const { onMouseMove } = useSpotlight();
  const posts = sortedPosts();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="fixed inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_70%)] pointer-events-none" />
      <div className="glow-blob animate-blob" style={{ width: 420, height: 420, top: '-8%', right: '-6%', background: 'radial-gradient(circle, hsl(192 100% 55% / 0.18), transparent 70%)' }} />

      <BlogTopBar />

      <main className="relative z-10 container mx-auto px-6 md:px-10 pt-16 pb-28 max-w-3xl">
        <header>
          <div className="flex items-center gap-3 mb-4">
            <PenLine size={16} className="text-primary" />
            <span className="kicker">Writing</span>
          </div>
          <h1 className="font-space text-4xl md:text-6xl font-bold tracking-tight">
            The <span className="accent-text">blog</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Notes on what I'm building, learning and breaking — AI, full-stack, hardware,
            and the occasional deep dive.
          </p>
        </header>

        <div className="mt-12 space-y-5">
          {posts.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                href={`/blog/${p.slug}`}
                onMouseMove={onMouseMove}
                className="card-spotlight panel group block p-6"
              >
                <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span>·</span>
                  <span>{readingTime(p.content)}</span>
                </div>
                <h2 className="font-space text-2xl font-bold leading-snug group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {p.tags?.map((t) => <span key={t} className="tag-chip text-muted-foreground">{t}</span>)}
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono text-sm text-primary group-hover:gap-2 transition-all">
                    Read <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="panel p-10 text-center text-muted-foreground">
              No posts yet — check back soon.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
