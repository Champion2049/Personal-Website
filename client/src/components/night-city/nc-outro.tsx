import { ArrowLeft, Mail, Instagram, Music2, Tv } from 'lucide-react';
import { identity, profiles, socials } from '@/lib/personal-data';

/** The page used to just stop after the arcade. This is the ending. */
export function NCOutro() {
  const backToGrid = () => window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/', reverse: true } }));
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-32 pt-28 md:pt-40">
      <div className="shard shard-lg relative overflow-hidden p-7 md:p-14">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <h2 id="contact-title" className="relative font-display text-5xl font-bold uppercase leading-[0.85] md:text-8xl">
          See you in
          <br />
          Night City, <span className="text-primary">choom.</span>
        </h2>
        <p className="relative mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{identity.outro}</p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${socials.email}?subject=${encodeURIComponent('Hey Chids')}`} className="nc-btn">
            <Mail size={16} /> Email me
          </a>
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="nc-btn nc-btn-ghost">
            <Instagram size={16} /> {socials.instagramHandle}
          </a>
          <a href={profiles.spotify} target="_blank" rel="noopener noreferrer" className="nc-btn nc-btn-ghost">
            <Music2 size={16} /> Spotify
          </a>
          <a href={profiles.myanimelist} target="_blank" rel="noopener noreferrer" className="nc-btn nc-btn-ghost">
            <Tv size={16} /> MyAnimeList
          </a>
        </div>
      </div>

      <footer className="mt-10 flex flex-col gap-4 border-t border-primary/15 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <button onClick={backToGrid} className="press group inline-flex items-center gap-2 font-display text-base font-semibold uppercase tracking-wider hover:text-[var(--nc-cyan)]">
          <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Back to the Grid
        </button>
        <p>
          Press <kbd className="border border-primary/30 px-1.5 py-0.5 font-mono text-xs">Shift + S</kbd> for the shell
        </p>
        <p>© {new Date().getFullYear()} Chirayu Chaudhari</p>
      </footer>
    </section>
  );
}
