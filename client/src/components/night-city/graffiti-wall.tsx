import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SprayCan } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Guestbook, InsertGuestbook } from '@shared/schema';

/**
 * The guestbook, Night City style: every message is a tag sprayed on a brick
 * wall. Same entries and API as the portfolio's guestbook. Each tag's colour,
 * tilt and offset come from a hash of its id, so the wall looks the same every
 * visit. Layout is plain flex-wrap, so tags never overlap at any width.
 */
const INKS = [
  { color: 'hsl(2 100% 62%)', glow: 'hsl(2 100% 55% / 0.75)' }, // neon red
  { color: 'var(--nc-yellow)', glow: 'hsl(56 100% 48% / 0.6)' }, // yellow
  { color: 'hsl(0 0% 96%)', glow: 'hsl(0 0% 100% / 0.35)' }, // white
  { color: 'hsl(2 100% 62%)', glow: 'hsl(2 100% 55% / 0.75)' },
  { color: 'var(--nc-cyan)', glow: 'hsl(183 100% 50% / 0.6)' }, // rare cyan
];
const MAX = 140;
const SHOWN = 24;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function Tag({ entry, fresh }: { entry: Guestbook; fresh: boolean }) {
  const h = hash(entry.id);
  const ink = INKS[h % INKS.length];
  const tilt = ((h >> 3) % 15) - 7; // -7..7 deg
  const lift = ((h >> 7) % 17) - 8; // px
  const size = entry.message.length < 40 ? 'text-2xl md:text-3xl' : entry.message.length < 90 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl';
  return (
    <li
      className={`nc-tag group relative max-w-[22rem] px-3 py-2 ${fresh ? 'nc-tag-fresh' : ''}`}
      style={{ transform: `translateY(${lift}px) rotate(${tilt}deg)`, color: ink.color, ['--glow' as string]: ink.glow }}
    >
      <p className={`font-marker leading-tight ${size}`}>{entry.message}</p>
      <p className="mt-1 text-right font-display text-sm font-bold uppercase tracking-[0.2em] opacity-80">— {entry.name}</p>
    </li>
  );
}

export function GraffitiWall() {
  const qc = useQueryClient();
  const { data: entries = [], isLoading, isError } = useQuery<Guestbook[]>({ queryKey: ['/api/guestbook'] });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [freshId, setFreshId] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  const tag = useMutation({
    mutationFn: async (entry: InsertGuestbook) => (await apiRequest('POST', '/api/guestbook', entry)).json() as Promise<Guestbook>,
    onSuccess: (created) => {
      setFreshId(created?.id ?? null);
      setName('');
      setMessage('');
      qc.invalidateQueries({ queryKey: ['/api/guestbook'] });
    },
  });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries],
  );
  const shown = all ? sorted : sorted.slice(0, SHOWN);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || tag.isPending) return;
    tag.mutate({ name: name.trim().slice(0, 40), message: message.trim().slice(0, MAX) });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="nc-bricks relative overflow-hidden px-4 py-10 md:px-8 md:py-14">
        {isLoading ? (
          <p className="text-center font-display text-xl uppercase tracking-widest text-muted-foreground">Reading the wall…</p>
        ) : isError ? (
          <p className="text-center font-marker text-2xl text-[var(--nc-yellow)]">The wall's offline. Try again later.</p>
        ) : shown.length ? (
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-16">
            {shown.map((e) => (
              <Tag key={e.id} entry={e} fresh={e.id === freshId} />
            ))}
          </ul>
        ) : (
          <p className="text-center font-marker text-3xl text-[var(--nc-yellow)]">Clean wall. Be the first to tag it.</p>
        )}
        {sorted.length > SHOWN && (
          <div className="mt-10 text-center">
            <button onClick={() => setAll((a) => !a)} className="nc-btn nc-btn-ghost">
              {all ? 'Fewer tags' : `All ${sorted.length} tags`}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="shard shard-lg p-6">
        <h3 className="font-display text-2xl font-bold uppercase tracking-wider">Tag the wall</h3>
        <p className="mt-1.5 text-muted-foreground">Leave a mark. It shows up here and in the portfolio's guestbook.</p>
        <label htmlFor="tag-name" className="mt-6 block text-sm text-muted-foreground">
          Your name
        </label>
        <input
          id="tag-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          className="mt-1.5 w-full border border-primary/30 bg-black/40 px-3 py-2.5 font-display text-lg outline-none focus:border-[var(--nc-yellow)]"
        />
        <label htmlFor="tag-msg" className="mt-4 block text-sm text-muted-foreground">
          Your tag <span className="tabular-nums">({message.length}/{MAX})</span>
        </label>
        <textarea
          id="tag-msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX}
          required
          rows={3}
          className="mt-1.5 w-full resize-none border border-primary/30 bg-black/40 px-3 py-2.5 font-marker text-xl outline-none focus:border-[var(--nc-yellow)]"
        />
        <button type="submit" disabled={tag.isPending} className="nc-btn mt-5 w-full justify-center">
          <SprayCan size={16} /> {tag.isPending ? 'Spraying…' : 'Spray it'}
        </button>
        {tag.isError && <p className="mt-3 text-sm text-[var(--nc-yellow)]">Couldn't reach the wall. Try again in a bit.</p>}
      </form>
    </div>
  );
}
