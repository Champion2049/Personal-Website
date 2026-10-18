import { useState, type FormEvent } from 'react';
import { HeartHandshake } from 'lucide-react';

/** /api/mal-match's answer (netlify/functions/_mal.ts, MatchResult). */
interface Entry { id: number; title: string; url: string; image: string | null; score: number; theirScore?: number }
interface Match {
  user: string;
  affinity: number | null;
  shared: number;
  sharedScored: number;
  theirTotal: number;
  bothLoved: Entry[];
  forThem: Entry[];
  forMe: Entry[];
}

const ERRORS: Record<string, string> = {
  invalid_user: 'That doesn’t look like a MyAnimeList username.',
  not_found: 'No MyAnimeList user by that name.',
  private_or_missing: 'Couldn’t read that list. Is it public, and spelled right?',
  unavailable: 'MyAnimeList isn’t answering right now. Try again in a bit.',
};

function verdict(a: number | null, scored: number) {
  if (a === null) return scored ? `Only ${scored} show${scored === 1 ? '' : 's'} we’ve both rated. Not enough to call it.` : 'We haven’t rated any of the same shows yet.';
  if (a >= 60) return 'Basically the same taste. Suspicious.';
  if (a >= 30) return 'Solid overlap. We’d agree on what to watch next.';
  if (a >= 0) return 'Some common ground, plenty to argue about.';
  return 'Opposite ends of the shelf. Respect.';
}

function List({ title, items, empty, scores }: { title: string; items: Entry[]; empty: string; scores: (e: Entry) => string }) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h4>
      {items.length ? (
        <ul className="mt-3 space-y-2.5">
          {items.map((e) => (
            <li key={e.id}>
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                {e.image ? (
                  <img src={e.image} alt="" loading="lazy" className="h-14 w-10 shrink-0 object-cover" />
                ) : (
                  <span className="h-14 w-10 shrink-0 bg-primary/10" />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-semibold leading-tight transition-colors group-hover:text-[var(--nc-yellow)]">{e.title}</span>
                  <span className="text-xs text-muted-foreground">{scores(e)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

/**
 * Anime taste match: a visitor's MyAnimeList against mine. Affinity is worked
 * out the way MAL does it, as the correlation of our scores on the shows we've
 * both rated, so it's about agreeing, not just overlapping.
 */
export function AnimeMatch() {
  const [user, setUser] = useState('');
  const [state, setState] = useState<{ status: 'idle' | 'loading' } | { status: 'error'; message: string } | { status: 'done'; match: Match }>({ status: 'idle' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = user.trim();
    if (!name) return;
    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/mal-match?user=${encodeURIComponent(name)}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ERRORS[body?.error] || ERRORS.unavailable);
      setState({ status: 'done', match: body as Match });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error && err.message ? err.message : ERRORS.unavailable });
    }
  };

  const m = state.status === 'done' ? state.match : null;
  const pct = m?.affinity ?? null;

  return (
    <div className="shard shard-lg mt-4 p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-md">
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-wider">
            <HeartHandshake size={20} className="text-primary" /> Taste match
          </h3>
          <p className="mt-1.5 text-muted-foreground">Drop your MyAnimeList username and see how close your anime taste is to mine.</p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
          <label htmlFor="mal-user" className="sr-only">
            Your MyAnimeList username
          </label>
          <input
            id="mal-user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            maxLength={16}
            autoComplete="off"
            spellCheck={false}
            placeholder="MAL username"
            className="min-w-0 flex-1 border border-primary/30 bg-black/40 px-3 py-2.5 font-display text-lg outline-none focus:border-[var(--nc-yellow)]"
          />
          <button type="submit" disabled={state.status === 'loading' || !user.trim()} className="nc-btn shrink-0">
            {state.status === 'loading' ? 'Reading…' : 'Compare'}
          </button>
        </form>
      </div>

      <div aria-live="polite">
        {state.status === 'error' && <p className="mt-6 text-[var(--nc-yellow)]">{state.message}</p>}

        {m && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div>
              <div className="text-sm text-muted-foreground">Affinity with {m.user}</div>
              <div className="font-display text-7xl font-bold leading-none tabular-nums text-[var(--nc-yellow)]">
                {pct === null ? '—' : `${pct > 0 ? '+' : ''}${Math.round(pct)}%`}
              </div>
              {/* -100 … 0 … +100 */}
              <div aria-hidden className="relative mt-4 h-1.5 bg-primary/15">
                <span className="absolute inset-y-0 left-1/2 w-px bg-primary/50" />
                {pct !== null && (
                  <span
                    className="absolute -top-1 h-3.5 w-1 bg-[var(--nc-yellow)] shadow-[0_0_10px_var(--nc-yellow)]"
                    style={{ left: `calc(${(pct + 100) / 2}% - 2px)` }}
                  />
                )}
              </div>
              <p className="mt-4 text-foreground">{verdict(pct, m.sharedScored)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {m.shared} show{m.shared === 1 ? '' : 's'} in common, out of the {m.theirTotal} you’ve seen.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <List title="We both loved" items={m.bothLoved} empty="No shared 8+ scores yet." scores={(e) => `me ${e.score} · you ${e.theirScore}`} />
              <List title="You should watch" items={m.forThem} empty="You’ve seen all my favourites." scores={(e) => `I gave it ${e.score}`} />
              <List title="I should watch" items={m.forMe} empty="Nothing of yours I haven’t seen." scores={(e) => `you gave it ${e.score}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
