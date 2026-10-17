import { useEffect, useState } from 'react';
import { LightCycleGame } from '@/components/ui/light-cycle-game';
import { SpotifyPanel, AnimeMangaPanel } from '@/components/ui/media-panels';
import { TronGrid } from '@/components/ui/tron-grid';
import { Lightbox, type LightboxItem } from '@/components/ui/lightbox';
import { CompatibilityQuiz } from '@/components/ui/compatibility-quiz';
import { NCNav } from '@/components/night-city/nc-nav';
import { NCHero } from '@/components/night-city/nc-hero';
import { NCSection } from '@/components/night-city/nc-section';
import { GameLibrary, gamesMeta } from '@/components/night-city/game-library';
import { Screenings } from '@/components/night-city/screenings';
import { RecReel } from '@/components/night-city/rec-reel';
import { BreachProtocol } from '@/components/night-city/breach-protocol';
import { NCOutro } from '@/components/night-city/nc-outro';
import { NCRain } from '@/components/night-city/nc-rain';
import { playGridTrack, stopGridTrack } from '@/lib/grid-audio';
import { identity, quiz } from '@/lib/personal-data';
import { loadFonts, NIGHT_CITY_FONTS } from '@/lib/fonts';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

loadFonts('night-city-fonts', NIGHT_CITY_FONTS);

/**
 * "Get to know me" — the red side of the Grid. Styled after Cyberpunk 2077's
 * own UI; all the content lives in lib/personal-data.ts.
 */
export default function AboutMe() {
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const openLightbox = (src: string, title: string) => setLightbox({ src, title });

  useEffect(() => {
    playGridTrack(); // also covers a hard reload (queues until first interaction if autoplay is blocked)
    return () => stopGridTrack();
  }, []);

  // The two arcade cabinets slide in from opposite sides.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>('#arcade [data-cabinet]').forEach((el, i) => {
      const dir = i === 0 ? -1 : 1;
      gsap.fromTo(
        el,
        { xPercent: dir * 14, rotate: dir * -2.5, autoAlpha: 0 },
        { xPercent: 0, rotate: 0, autoAlpha: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 60%', scrub: 0.6 } },
      );
    });
  });

  useEffect(() => {
    document.documentElement.classList.add('cyber-scroll');
    const prevTitle = document.title;
    document.title = `${identity.handle} — Night City`;
    return () => {
      document.documentElement.classList.remove('cyber-scroll');
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="dark theme-cyber relative min-h-screen overflow-x-clip">
      {/* solid backdrop so the dark-blue body bg never shows (e.g. on overscroll / below content) */}
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ background: 'hsl(0 45% 4%)', zIndex: -1 }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-70">
        <TronGrid color="#ff4034" fade="top" />
      </div>
      <div aria-hidden className="glow-blob animate-blob" style={{ width: 520, height: 520, top: '-12%', right: '-10%', background: 'radial-gradient(circle, hsl(2 100% 60% / 0.22), transparent 70%)' }} />
      <div aria-hidden className="nc-scanlines" />
      <NCRain />

      <NCNav />

      <main className="container relative z-10 mx-auto px-5 pb-12 md:px-10">
        <NCHero />

        <NCSection id="radio" index="01" title="Radio" meta="Live from my Spotify">
          <SpotifyPanel />
        </NCSection>

        <NCSection id="anime" index="02" title="Anime & manga" meta="Live from MyAnimeList">
          <AnimeMangaPanel />
        </NCSection>

        <NCSection id="games" index="03" title="Games" meta={gamesMeta}>
          <GameLibrary onOpen={openLightbox} />
        </NCSection>

        <NCSection id="screen" index="04" title="Films & TV" meta="Ranked. Scores are mine, out of 10.">
          <Screenings onOpen={openLightbox} />
        </NCSection>

        <NCSection id="pick" index="05" title="Pick for me">
          <RecReel />
        </NCSection>

        <NCSection id="vibe" index="06" title="Vibe check" meta={`${quiz.length} questions, no wrong answers`}>
          <CompatibilityQuiz />
        </NCSection>

        <NCSection id="arcade" index="07" title="Arcade">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            <div data-cabinet className="shard shard-lg p-5 md:p-7">
              <h3 className="font-tron text-xl font-bold tracking-wider">Light-Cycle</h3>
              <p className="mt-1.5 mb-6 text-muted-foreground">
                Sticking with the Tron theme. Steer with the arrow keys or WASD, grab the energy nodes, and don't cross your own trail.
              </p>
              <LightCycleGame />
            </div>
            <div data-cabinet className="shard shard-lg p-5 md:p-7 [--shard-line:hsl(64_60%_50%/0.3)]">
              <h3 className="font-display text-2xl font-bold uppercase tracking-wider text-[hsl(64_85%_66%)]">Breach Protocol</h3>
              <p className="mt-1.5 mb-6 text-muted-foreground">
                Cyberpunk's netrunning minigame. Upload all three daemons to unlock three shards about me.
              </p>
              <BreachProtocol />
            </div>
          </div>
        </NCSection>

        <NCOutro />
      </main>

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
