import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Music2, Tv, Gamepad2, Film, Headphones, BookOpen,
  Sparkles, Crown, Star, Gamepad2 as Pad, MonitorPlay,
} from 'lucide-react';
import { LightCycleGame } from '@/components/ui/light-cycle-game';
import { SpotifyPanel, AnimeMangaPanel } from '@/components/ui/media-panels';
import { TronGrid } from '@/components/ui/tron-grid';
import { AudioMuteButton } from '@/components/ui/audio-mute-button';
import { Lightbox, type LightboxItem } from '@/components/ui/lightbox';
import { playGridTrack, stopGridTrack } from '@/lib/grid-audio';
import { CompatibilityQuiz } from '@/components/ui/compatibility-quiz';
import { useSpotlight } from '@/lib/use-spotlight';
import {
  now, movies, tvShows, favouriteGame, gamesILike, wantToPlay,
  type GameItem, type RankItem,
} from '@/lib/personal-data';

/* Neon cover tile — uses an image if provided, else a generated placeholder */
function Cover({ item, className = '', onOpen }: { item: GameItem | RankItem; className?: string; onOpen?: (src: string, title: string) => void }) {
  const hue = 330 + (item.title.length * 11) % 50;
  const [err, setErr] = useState(false);
  const hasImg = !!(item.cover && !err);
  return (
    <div
      onClick={() => { if (hasImg && onOpen) onOpen(item.cover!, item.title); }}
      className={`group relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-primary/20 ${hasImg ? 'cursor-zoom-in' : ''} ${className}`}
      style={{ boxShadow: 'inset 0 0 40px hsl(350 100% 55% / 0.12)' }}
    >
      {hasImg ? (
        <img src={item.cover} alt={item.title} onError={() => setErr(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      ) : (
        <div
          className="h-full w-full grid place-items-center p-2 text-center"
          style={{ background: `linear-gradient(150deg, hsl(${hue} 70% 12%), hsl(345 60% 6%))` }}
        >
          <span className="font-display text-xs leading-tight text-primary/90">{item.title}</span>
        </div>
      )}
      {item.rating != null && (
        <span className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-primary backdrop-blur-sm">
          <Star size={9} className="fill-current" /> {item.rating.toFixed(1)}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
        <p className="text-[0.7rem] font-medium leading-tight line-clamp-2">{item.title}</p>
      </div>
    </div>
  );
}

function Backdrop({ item, rank, onMouseMove, delay = 0, onOpen }: { item: RankItem; rank: number; onMouseMove?: any; delay?: number; onOpen?: (src: string, title: string) => void }) {
  const hue = 330 + (item.title.length * 11) % 50;
  const [err, setErr] = useState(false);
  const hasImg = !!(item.cover && !err);
  return (
    <motion.div
      onMouseMove={onMouseMove}
      onClick={() => { if (hasImg && onOpen) onOpen(item.cover!, item.title); }}
      className={`card-spotlight panel group relative overflow-hidden min-h-[112px] flex items-end ${hasImg ? 'cursor-zoom-in' : ''}`}
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.45, delay }}
    >
      {hasImg ? (
        <img src={item.cover} alt={item.title} onError={() => setErr(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 14%), hsl(345 60% 7%))` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/25" />
      {item.rating != null && (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-black/60 px-2 py-0.5 font-mono text-xs font-semibold text-primary backdrop-blur-sm">
          <Star size={11} className="fill-current" /> {item.rating.toFixed(1)}
        </span>
      )}
      <div className="relative flex items-end gap-3 p-4 w-full">
        <span className="font-display text-4xl font-bold text-primary/80 leading-none">{rank}</span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-space text-lg font-semibold truncate text-white">{item.title}</h3>
            {item.year && <span className="font-mono text-xs text-white/60">{item.year}</span>}
          </div>
          {item.note && <p className="text-sm text-white/70 italic line-clamp-2">{item.note}</p>}
        </div>
      </div>
    </motion.div>
  );
}

const nowItems = [
  { icon: Headphones, label: 'Fav Song Rn', value: now.listening },
  { icon: Tv, label: 'Watching', value: now.watching },
  { icon: Gamepad2, label: 'Playing', value: now.playing },
  { icon: BookOpen, label: 'Reading', value: now.reading },
];

export default function AboutMe() {
  const { onMouseMove } = useSpotlight();
  const [boot, setBoot] = useState(0);
  const [favErr, setFavErr] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const openLightbox = (src: string, title: string) => setLightbox({ src, title });
  const bootLines = [
    '> initializing identity.sys ...',
    '> decrypting personality matrix ...',
    '> mounting /taste /games /films ...',
    '> greetings programs! welcome to the grid.',
  ];

  useEffect(() => {
    const t = setInterval(() => setBoot((b) => (b < bootLines.length ? b + 1 : b)), 450);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    playGridTrack(); // also covers a hard reload (queues until first interaction if autoplay is blocked)
    return () => stopGridTrack();
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('cyber-scroll');
    return () => document.documentElement.classList.remove('cyber-scroll');
  }, []);

  return (
    <div className="dark theme-cyber min-h-screen relative overflow-x-clip">
      {/* solid backdrop so the dark-blue body bg never shows (e.g. on overscroll / below content) */}
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ background: 'hsl(345 45% 4%)', zIndex: -1 }} />
      <div className="fixed inset-0 [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_72%)] pointer-events-none">
        <TronGrid color="#ff2d63" />
      </div>
      <div className="glow-blob animate-blob" style={{ width: 480, height: 480, top: '-10%', left: '-8%', background: 'radial-gradient(circle, hsl(350 100% 60% / 0.28), transparent 70%)' }} />
      <div className="glow-blob animate-blob" style={{ width: 420, height: 420, bottom: '-10%', right: '-6%', background: 'radial-gradient(circle, hsl(320 100% 60% / 0.22), transparent 70%)', animationDelay: '5s' }} />

      {/* Top bar */}
      <nav className="sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="mx-auto max-w-6xl glass-effect rounded-2xl px-5 py-3 flex items-center justify-between">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('enter-grid', { detail: { to: '/', reverse: true } }))}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Back to portfolio
          </button>
          <span className="font-mono text-sm font-semibold">chirayu<span className="text-primary">.dev</span></span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-mono text-[0.7rem] tracking-[0.3em] uppercase text-primary/70">// night city</span>
            <AudioMuteButton />
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 md:px-10 pb-28">
        {/* Hero / boot */}
        <header className="pt-16 pb-12 max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <Pad size={16} className="text-primary" />
            <span className="kicker">Off the clock</span>
          </div>
          <div className="mt-7 panel p-4 font-mono text-sm max-w-md">
            {bootLines.slice(0, boot).map((l, i) => (
              <div key={i} className={i === bootLines.length - 1 ? 'text-primary' : 'text-muted-foreground'}>{l}</div>
            ))}
            {boot < bootLines.length && <span className="inline-block w-2 h-4 translate-y-0.5 bg-primary animate-pulse" />}
          </div>
          <br></br>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight neon-text">
            Get to know me
          </h1>
          
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Hey there, I'm Chirayu, but you can also call me Chids. I assume you aren't here for the technical details, so let's skip the formalities. 
            So I'm just a regular dude who likes to code, play games and occasionally watch an anime or a movie. I also like to read, but I don't do it as much as I'd like to. 
            I do have a very vast taste in music, and I like to listen to a lot of different genres.<br></br>
            PC gaming is a very big part of my life, and I like to play a lot of different games, as you will probably see below in the games section.
            I am also very into Biking and Car stuff. So if you ever want to talk about bikes or cars, I'm your guy. I also like to go to the gym, but I don't end up going as regularly as I would like to. I also like to play badminton, but I don't get to play it as much as I would like to.
            My other hobbies include Hiking/ Trekking or any kind of sports, as a matter of fact I also do enjoy eating a lot of different kinds of food, and I like to try out new restaurants and cafes.<br></br>
            Anyways, that's a bit about me and I hope you like the website. If you want to know more, feel free to reach out to me on any of my socials, or just send me an email. I am always open to making new friends and connections.          
          </p>

          
        </header>

        {/* Now */}
        <Section icon={Sparkles} title="Currently into">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nowItems.map((n, i) => (
              <motion.div
                key={n.label}
                onMouseMove={onMouseMove}
                className="card-spotlight panel p-5"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <n.icon size={18} className="text-primary mb-3" />
                <div className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{n.label}</div>
                <div className="mt-1 text-sm font-medium leading-snug">{n.value}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Music */}
        <Section icon={Music2} title="On rotation">
          <SpotifyPanel onMouseMove={onMouseMove} />
        </Section>

        {/* Anime & Manga */}
        <Section icon={Tv} title="Animes & Mangas">
          <AnimeMangaPanel onMouseMove={onMouseMove} />
        </Section>

        {/* Compatibility quiz — taste bars are revealed at the end */}
        <Section icon={Sparkles} title="Are we compatible?">
          <CompatibilityQuiz onMouseMove={onMouseMove} />
        </Section>

        {/* Games */}
        <Section icon={Gamepad2} title="Games">
          {/* Favourite */}
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-primary/70 mb-4">★ Crowned favourite ★</p>
          <motion.div
            onMouseMove={onMouseMove}
            onClick={() => { if (favouriteGame.cover && !favErr) openLightbox(favouriteGame.cover, favouriteGame.title); }}
            className={`card-spotlight panel group relative overflow-hidden mb-10 mx-auto max-w-2xl min-h-[240px] flex items-center justify-center text-center ${favouriteGame.cover && !favErr ? 'cursor-zoom-in' : ''}`}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            {favouriteGame.cover && !favErr ? (
              <img src={favouriteGame.cover} alt={favouriteGame.title} onError={() => setFavErr(true)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(345 70% 16%), hsl(345 55% 6%))' }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/40" />
            <div className="relative px-6 py-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-primary text-xs font-mono">
                  <Crown size={14} /> All-time #1
                </span>
                {favouriteGame.rating != null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-primary text-xs font-mono">
                    <Star size={12} className="fill-current" /> {favouriteGame.rating.toFixed(1)}/10
                  </span>
                )}
              </div>
              <h3 className="font-display text-3xl md:text-5xl font-bold neon-text">{favouriteGame.title}</h3>
              {favouriteGame.note && <p className="text-white/75 italic mt-3 max-w-md mx-auto">{favouriteGame.note}</p>}
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {favouriteGame.tags?.map((t) => (
                  <span key={t} className="tag-chip border-primary/50 text-primary">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Games I like */}
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Games I like</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {gamesILike.map((g, i) => (
              <motion.div key={g.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}>
                <Cover item={g} onOpen={openLightbox} />
              </motion.div>
            ))}
          </div>

          {/* Want to play */}
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Want to play</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {wantToPlay.map((g, i) => (
              <motion.div key={g.title} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }} className="opacity-80">
                <Cover item={g} onOpen={openLightbox} />
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Movies */}
        <Section icon={Film} title="Films, ranked">
          <div className="grid md:grid-cols-2 gap-3">
            {movies.map((m, i) => (
              <Backdrop key={m.title} item={m} rank={i + 1} onMouseMove={onMouseMove} delay={i * 0.05} onOpen={openLightbox} />
            ))}
          </div>
        </Section>

        {/* TV shows */}
        <Section icon={MonitorPlay} title="TV shows, ranked">
          <div className="grid md:grid-cols-2 gap-3">
            {tvShows.map((m, i) => (
              <Backdrop key={m.title} item={m} rank={i + 1} onMouseMove={onMouseMove} delay={i * 0.05} onOpen={openLightbox} />
            ))}
          </div>
        </Section>

        {/* Light cycle game */}
        <Section icon={Gamepad2} title="Enter the Grid">
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Sticking with the Tron theme, here is a Tron themed light-cycle game. Steer with the arrow keys,
            grab the energy nodes, and don't cross your own trail.
          </p>
          <div className="panel p-6 max-w-2xl mx-auto">
            <LightCycleGame />
          </div>
        </Section>
      </main>

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <section className="pt-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="hairline flex-1 ml-2" />
      </div>
      {children}
    </section>
  );
}
