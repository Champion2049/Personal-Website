import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Star, GitFork, Users, BookMarked, ArrowUpRight, ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSpotlight } from '@/lib/use-spotlight';

const USERNAME = 'Champion2049';

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  archived?: boolean;
  updated_at: string;
}

interface Profile {
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
}

const langColor = (l: string) => {
  const map: Record<string, string> = {
    Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6',
    Jupyter: '#DA5B0B', 'Jupyter Notebook': '#DA5B0B', HTML: '#e34c26',
    Java: '#b07219', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
    CSS: '#563d7c', Shell: '#89e051', Go: '#00ADD8', Rust: '#dea584',
  };
  return map[l] || 'hsl(192 100% 55%)';
};

function RepoCard({ r }: { r: Repo }) {
  return (
    <a
      href={r.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-border p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium truncate group-hover:text-primary transition-colors">{r.name}</span>
        <ArrowUpRight size={14} className="shrink-0 text-muted-foreground group-hover:text-primary" />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 h-8">
        {r.description || 'No description provided.'}
      </p>
      <div className="mt-3 flex items-center gap-4 font-mono text-[0.7rem] text-muted-foreground">
        {r.language && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: langColor(r.language) }} />
            {r.language}
          </span>
        )}
        <span className="flex items-center gap-1"><Star size={11} /> {r.stargazers_count}</span>
        <span className="flex items-center gap-1"><GitFork size={11} /> {r.forks_count}</span>
      </div>
    </a>
  );
}

export function GithubSection() {
  const { onMouseMove } = useSpotlight();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [pRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${USERNAME}`),
          fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`),
        ]);
        if (!pRes.ok || !rRes.ok) throw new Error('GitHub API error');
        const p = await pRes.json();
        const r: Repo[] = await rRes.json();
        if (cancelled) return;
        setProfile(p);
        setRepos(Array.isArray(r) ? r : []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const langCounts = repos.reduce<Record<string, number>>((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const topLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const langTotal = topLangs.reduce((s, [, c]) => s + c, 0) || 1;

  // Own (non-fork) public repos — the "relevant" set.
  const ownRepos = repos.filter((r) => !r.fork);
  const topRepos = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.updated_at) - +new Date(a.updated_at))
    .slice(0, 4);
  const topNames = new Set(topRepos.map((r) => r.name));
  // Everything else, most-recently-pushed first.
  const moreRepos = ownRepos
    .filter((r) => !topNames.has(r.name))
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));

  const stats = [
    { icon: BookMarked, label: 'Public Repos', value: profile?.public_repos },
    { icon: Star, label: 'Total Stars', value: error ? undefined : totalStars },
    { icon: Users, label: 'Followers', value: profile?.followers },
    { icon: GitFork, label: 'Following', value: profile?.following },
  ];

  return (
    <section id="github" className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <SectionHeading
          index="06"
          kicker="Live from GitHub"
          title={<>Always <span className="accent-text">shipping</span></>}
          description="Pulled live from the GitHub API on each visit. Stars, repos, languages, the works. I'm an open-source enthusiast, and everything I build is public (and linked here)."
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="card-spotlight panel p-5"
              onMouseMove={onMouseMove}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <s.icon size={18} className="text-primary mb-3" />
              <div className="font-space text-3xl font-bold">
                {loading ? <span className="inline-block h-8 w-12 rounded bg-muted animate-pulse" /> : (s.value ?? '—')}
              </div>
              <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Languages */}
          <motion.div
            className="lg:col-span-2 card-spotlight panel p-6"
            onMouseMove={onMouseMove}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-space text-lg font-semibold mb-1">Most-used languages</h3>
            <p className="font-mono text-xs text-muted-foreground mb-5">by repository count</p>

            {/* stacked bar */}
            {topLangs.length > 0 && (
              <div className="flex h-2.5 w-full overflow-hidden rounded-full mb-5">
                {topLangs.map(([l, c]) => (
                  <div key={l} style={{ width: `${(c / langTotal) * 100}%`, background: langColor(l) }} />
                ))}
              </div>
            )}

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 w-full rounded bg-muted animate-pulse" />
                ))
              ) : topLangs.length ? (
                topLangs.map(([l, c]) => (
                  <div key={l} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(l) }} />
                      {l}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{Math.round((c / langTotal) * 100)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Language data unavailable right now.</p>
              )}
            </div>
          </motion.div>

          {/* Top repos */}
          <motion.div
            className="lg:col-span-3 card-spotlight panel p-6"
            onMouseMove={onMouseMove}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-space text-lg font-semibold">Recent &amp; top repositories</h3>
              <a
                href={`https://github.com/${USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:gap-2.5 transition-all"
              >
                <Github size={14} /> @{USERNAME}
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                ))
              ) : topRepos.length ? (
                topRepos.map((r) => <RepoCard key={r.name} r={r} />)
              ) : (
                <p className="text-sm text-muted-foreground col-span-2">
                  Couldn't reach GitHub right now (the public API rate-limits unauthenticated requests).
                  Visit <a className="text-primary" href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer">@{USERNAME}</a> directly.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* All other repositories — expandable, pulled live */}
        {!loading && moreRepos.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mx-auto flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              aria-expanded={showAll}
            >
              {showAll ? 'Hide' : `View all ${moreRepos.length} more`} repositories
              <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence initial={false}>
              {showAll && (
                <motion.div
                  key="all-repos"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-5">
                    {moreRepos.map((r) => <RepoCard key={r.name} r={r} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
