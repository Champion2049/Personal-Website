import { useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getPost } from '@/lib/blog-data';
import { renderMarkdown, readingTime } from '@/lib/markdown';

export default function BlogPost() {
  const [, params] = useRoute('/blog/:slug');
  const post = params ? getPost(params.slug) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [params?.slug]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="fixed inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_72%)] pointer-events-none" />

      <nav className="sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="mx-auto max-w-3xl glass-effect rounded-2xl px-5 py-3 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> All posts
          </Link>
          <span className="font-mono text-sm font-semibold">chirayu<span className="text-primary">.dev</span></span>
          <span className="w-16" />
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 md:px-10 pt-16 pb-28 max-w-3xl">
        {!post ? (
          <div className="panel p-10 text-center">
            <h1 className="font-space text-2xl font-bold mb-2">Post not found</h1>
            <p className="text-muted-foreground mb-6">That post doesn't exist (or hasn't been written yet).</p>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground">
              Back to the blog
            </Link>
          </div>
        ) : (
          <article>
            <header className="mb-10">
              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span>·</span>
                <span>{readingTime(post.content)}</span>
              </div>
              <h1 className="font-space text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mt-5">
                {post.tags?.map((t) => <span key={t} className="tag-chip text-muted-foreground">{t}</span>)}
              </div>
              <div className="hairline mt-8" />
            </header>

            <div
              className="prose prose-invert max-w-none prose-headings:font-space prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:font-mono prose-pre:bg-black/50 prose-pre:border prose-pre:border-border prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />
          </article>
        )}
      </main>
    </div>
  );
}
