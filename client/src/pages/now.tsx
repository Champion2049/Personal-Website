import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { now, socials, credit } from '@/lib/personal-data';
import { projectsData } from '@/lib/projects-data';
import { enterNightCity } from '@/components/hud/hud-frame';

const GITHUB = 'Champion2049';

/** "3h ago" style relative time. */
function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  const units: [number, string][] = [[31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']];
  for (const [n, u] of units) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return 'just now';
}

const json = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

interface Commit { repo: string; message: string; at: string; url: string }

/** The latest distinct commit messages from public push events. */
function useCommits() {
  return useQuery<Commit[]>({
    queryKey: ['now-github'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const events: any[] = await json(`https://api.github.com/users/${GITHUB}/events/public?per_page=40`);
      const out: Commit[] = [];
      for (const e of events) {
        if (e.type !== 'PushEvent') continue;
        const repo = e.repo.name.split('/')[1];
        for (const c of [...(e.payload?.commits ?? [])].reverse()) {
          const message = String(c.message).split('\n')[0];
          if (out.some((o) => o.message === message)) continue;
          out.push({ repo, message, at: e.created_at, url: `https://github.com/${e.repo.name}/commit/${c.sha}` });
          if (out.length >= 4) return out;
        }
      }
      return out;
    },
  });
}

interface MalUpdate { title: string; url: string; status: string; progress: string; at: string }

const STATUS: Record<string, string> = { watching: 'Watching', reading: 'Reading', completed: 'Completed', on_hold: 'On hold', dropped: 'Dropped' };
const RECENT_MS = 60 * 86400_000;

/** What I'm watching/reading on MyAnimeList: anything in progress, plus whatever else changed in the last two months. */
function useMal() {
  return useQuery<{ anime: MalUpdate[]; manga: MalUpdate[] }>({
    queryKey: ['now-mal'],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const data = await json('/api/mal');
      const pick = (kind: 'anime' | 'manga', n: number): MalUpdate[] =>
        (data?.[kind]?.recent ?? [])
          .filter((e: any) => e.status === 'watching' || e.status === 'reading' || Date.now() - +new Date(e.updatedAt) < RECENT_MS)
          .slice(0, n)
          .map((e: any) => ({
            title: e.title,
            url: e.url,
            status: STATUS[e.status] ?? '',
            progress: e.progress ? `${kind === 'anime' ? 'ep' : 'ch'} ${e.progress}${e.total ? ` / ${e.total}` : ''}` : '',
            at: e.updatedAt,
          }));
      return { anime: pick('anime', 3), manga: pick('manga', 2) };
    },
  });
}

interface Track { isPlaying: boolean; title?: string; artist?: string; songUrl?: string }

function useTrack() {
  return useQuery<Track>({
    queryKey: ['now-spotify'],
    staleTime: 60_000,
    refetchInterval: 60_000,
    queryFn: () => json(`/api/spotify?t=${Date.now()}`),
  });
}

function useClock() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/** One row of the page: a quiet label on the left, the thing itself on the right. */
function Row({ label, live, children }: { label: string; live?: boolean; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-[var(--line)] py-8 md:grid-cols-[12rem_1fr] md:gap-10 md:py-10">
      <h2 className="flex items-center gap-2 text-sm text-muted-foreground md:pt-1.5">
        {label}
        {live && <span title="Live" className="h-1.5 w-1.5 bg-primary shadow-[0_0_6px_hsl(186_100%_50%)]" />}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const Big = ({ children }: { children: ReactNode }) => <p className="text-xl leading-snug text-foreground md:text-2xl">{children}</p>;
const Meta = ({ children }: { children: ReactNode }) => <p className="mt-1 text-sm text-muted-foreground">{children}</p>;
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-baseline gap-1 hover:text-primary">
    {children}
    <ArrowUpRight size={15} className="shrink-0 self-center text-muted-foreground transition-colors group-hover:text-primary" />
  </a>
);

/**
 * /now: what I'm doing at the moment, in the spirit of nownownow.com. Commits,
 * anime and the current track are live; the rest comes from personal-data.
 */
export default function Now() {
  const commits = useCommits();
  const mal = useMal();
  const track = useTrack();
  const time = useClock();
  const recent = projectsData.slice(0, 2);
  const book = now.reading && now.reading.toLowerCase() !== 'none' ? credit(now.reading) : null;
  const song = credit(now.listening);
  // what Spotify is playing this minute, when it's something other than the song above
  const live = track.data?.isPlaying && track.data.title && track.data.artist && track.data.title !== song.title ? track.data : null;
  const manga = mal.data?.manga ?? [];

  useEffect(() => {
    const prev = document.title;
    document.title = 'Now — Chirayu Chaudhari';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={16} /> Portfolio
        </Link>
        <button onClick={enterNightCity} className="text-sm text-[hsl(2_100%_68%)] transition-colors hover:text-[hsl(2_100%_75%)]">
          Night City →
        </button>
      </nav>

      <main className="mx-auto max-w-4xl px-6 pb-28 pt-10 md:px-10 md:pt-16">
        <header className="mb-14">
          <h1 className="font-display text-[clamp(4rem,14vw,9rem)] font-extrabold uppercase leading-[0.85] tracking-tight">
            Now<span className="text-primary">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            What I'm up to at the moment. The rows marked live update themselves; the rest I update by hand, last in {now.updated}.
          </p>
        </header>

        <Row label="Building" live={!!commits.data?.length}>
          {commits.data?.length ? (
            <ul className="space-y-5">
              {commits.data.map((c) => (
                <li key={c.url}>
                  <Big>
                    <Ext href={c.url}>{c.message}</Ext>
                  </Big>
                  <Meta>
                    {c.repo} · {ago(c.at)}
                  </Meta>
                </li>
              ))}
            </ul>
          ) : (
            <Big>
              {commits.isLoading ? 'Checking GitHub…' : <Ext href={`https://github.com/${GITHUB}`}>Everything's on GitHub</Ext>}
            </Big>
          )}
        </Row>

        <Row label="Lately">
          <ul className="space-y-5">
            {recent.map((p) => (
              <li key={p.title}>
                <Big>
                  <Ext href={p.github}>{p.title}</Ext>
                </Big>
                <Meta>
                  {p.period} · {p.tags.join(', ')}
                </Meta>
              </li>
            ))}
          </ul>
        </Row>

        <Row label="Listening" live={!!live}>
          <Big>{now.listeningUrl ? <Ext href={now.listeningUrl}>{song.title}</Ext> : song.title}</Big>
          <Meta>{[song.by, 'on repeat'].filter(Boolean).join(' · ')}</Meta>
          {live && (
            <p className="mt-4 text-sm text-muted-foreground">
              Playing right now:{' '}
              {live.songUrl ? (
                <a href={live.songUrl} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary">
                  {live.title}
                </a>
              ) : (
                <span className="text-foreground">{live.title}</span>
              )}{' '}
              · {live.artist}
            </p>
          )}
        </Row>

        <Row label="Watching" live={!!mal.data?.anime.length}>
          <ul className="space-y-5">
            {mal.data?.anime.map((a) => (
              <li key={a.url}>
                <Big>
                  <Ext href={a.url}>{a.title}</Ext>
                </Big>
                <Meta>
                  {[a.status, a.progress, ago(a.at)].filter(Boolean).join(' · ')}
                </Meta>
              </li>
            ))}
            <li>
              <Big>{now.watching}</Big>
              <Meta>TV</Meta>
            </li>
          </ul>
        </Row>

        <Row label="Reading" live={!!manga.length}>
          {book || manga.length ? (
            <ul className="space-y-5">
              {book && (
                <li>
                  <Big>{book.title}</Big>
                  {book.by && <Meta>{book.by}</Meta>}
                </li>
              )}
              {manga.map((m) => (
                <li key={m.url}>
                  <Big>
                    <Ext href={m.url}>{m.title}</Ext>
                  </Big>
                  <Meta>{[m.status, m.progress, ago(m.at)].filter(Boolean).join(' · ')}</Meta>
                </li>
              ))}
            </ul>
          ) : (
            <Big>
              Nothing right now.{' '}
              <a className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href={`mailto:${socials.email}?subject=${encodeURIComponent('A book you should read')}`}>
                Recommend me one?
              </a>
            </Big>
          )}
        </Row>

        <Row label="Playing">
          <Big>{now.playing}</Big>
        </Row>

        <Row label="Status">
          <Big>Open to internships &amp; research</Big>
          <Meta>Bengaluru · {time} IST</Meta>
        </Row>

        <p className="mt-16 text-sm text-muted-foreground">
          This is a{' '}
          <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-primary">
            now page
          </a>
          .
        </p>
      </main>
    </div>
  );
}
