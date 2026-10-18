import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { useIntroReady } from '@/lib/intro-gate';

/**
 * Arrival: a camera flythrough of a rainy Night City street, rendered in
 * Blender (tools/blender/night_city_flythrough.py) and encoded as a short
 * H.264 video that scroll scrubs, Apple-product-page style. The section pins
 * while you scroll through it; a few lines of copy hand over along the way.
 *
 * Why a video and not frames: it's one small file, the GPU's video decoder
 * does the work off the main thread, and only the current frame is ever held
 * in memory. It's encoded with a keyframe every 6 frames, so a seek in either
 * direction decodes at most a handful of frames. The file is fetched whole into
 * a blob so scrubbing never waits on range requests. Seeks are queued: a new
 * one is only issued once the previous `seeked` fires.
 *
 * Portrait screens get their own re-framed video, and there's a VP9 WebM for
 * browsers without H.264. Reduced motion: the poster, no pin.
 */
const SOURCES = {
  desktop: { name: 'nc-desktop', poster: '/nightcity/fly/poster.jpg' },
  mobile: { name: 'nc-mobile', poster: '/nightcity/fly/poster-mobile.jpg' },
} as const;

/** H.264 everywhere it plays (all major browsers); VP9 WebM for builds without it (e.g. some Linux Chromiums). */
function videoUrl(v: HTMLVideoElement, name: string) {
  const h264 = v.canPlayType('video/mp4; codecs="avc1.640028"');
  return `/nightcity/fly/${name}.${h264 ? 'mp4' : 'webm'}`;
}

export function NCArrival({ onCover }: { onCover?: (covering: boolean) => void }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const ready = useIntroReady();
  const [reduce] = useState(prefersReducedMotion);
  const [source] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 0.9 ? SOURCES.mobile : SOURCES.desktop,
  );
  const progress = useRef(0); // wanted position through the clip, 0..1

  // Load the whole file, then prime it (iOS won't decode frames for seeking until it has played once).
  useEffect(() => {
    const v = video.current;
    if (!v || reduce) return;
    let url = '';
    let cancelled = false;
    fetch(videoUrl(v, source.name))
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        v.src = url;
        return v.play().then(() => {
          v.pause();
          seek(v); // catch up with wherever the page is already scrolled
        });
      })
      .catch(() => {
        /* the poster stays up */
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source, reduce]);

  // Seek queue: one seek in flight at a time, always towards the latest target.
  useEffect(() => {
    const v = video.current;
    if (!v || reduce) return;
    const onSeeked = () => seek(v);
    v.addEventListener('seeked', onSeeked);
    return () => v.removeEventListener('seeked', onSeeked);
  }, [reduce]);

  const seek = (v: HTMLVideoElement) => {
    if (v.seeking || v.readyState < 1 || !v.duration) return;
    const t = Math.max(0, Math.min(progress.current * v.duration, v.duration - 0.001));
    if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
  };

  // Scroll: pin and scrub the video; two lines of copy hand over, then the render's own sign.
  useGSAP(
    () => {
      if (reduce) return;
      const q = gsap.utils.selector(root);
      const proxy = { p: 0 };
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=220%',
            scrub: 0.5,
            pin: true,
            // it fills the screen from the top of the page until the pin releases
            onRefresh: (self) => onCover?.(self.scroll() < self.end),
            onLeave: () => onCover?.(false),
            onEnterBack: () => onCover?.(true),
          },
        })
        .to(proxy, {
          p: 1,
          duration: 1,
          onUpdate: () => {
            progress.current = proxy.p;
            if (video.current) seek(video.current);
          },
        }, 0)
        .to(q('[data-hint]'), { autoAlpha: 0, duration: 0.05 }, 0.02)
        .to(q('[data-beat="1"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.2)
        .fromTo(q('[data-beat="2"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.32)
        .to(q('[data-beat="2"]'), { autoAlpha: 0, y: -40, duration: 0.1 }, 0.55)
        // the last stretch belongs to the sign in the render; dim it a little as the page takes over
        .to(q('[data-shade]'), { opacity: 0.45, duration: 0.08 }, 0.92);
    },
    { scope: root },
  );

  // Entrance once the grid transition lifts.
  useGSAP(
    () => {
      if (!ready || reduce) return;
      gsap.from(root.current!.querySelectorAll('[data-in]'), { autoAlpha: 0, y: 30, duration: 1, ease: 'expo.out', stagger: 0.12, delay: 0.1 });
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section ref={root} aria-label="Arrival in Night City" className="relative h-[100svh] overflow-hidden bg-[hsl(225_45%_4%)]">
      <video
        ref={video}
        aria-hidden
        muted
        playsInline
        preload="none"
        poster={source.poster}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* keep the copy legible over the brightest frames */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(225_45%_4%/0.55),transparent_30%,transparent_60%,hsl(225_45%_4%/0.85))]" />
      <div data-shade aria-hidden className="pointer-events-none absolute inset-0 bg-[hsl(225_45%_4%)] opacity-0" />

      <div className="container relative mx-auto flex h-full flex-col justify-end px-5 pb-[14vh] md:px-10">
        <div data-beat="1" className="max-w-4xl">
          <p data-in className="font-display text-xl font-semibold uppercase tracking-[0.3em] text-[var(--nc-yellow)]">You crossed over</p>
          <p data-in data-text="The other side" className="nc-glitch nc-glitch-hover mt-2 block font-display text-[clamp(3.4rem,10vw,9rem)] font-bold uppercase leading-[0.85]">
            The other side
          </p>
        </div>
        <p data-beat="2" className="invisible absolute bottom-[14vh] max-w-3xl font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold uppercase leading-[0.95]">
          Games, music, anime <span className="text-[var(--nc-yellow)]">&amp; the rest of me.</span>
        </p>
      </div>

      <div data-hint data-in aria-hidden className="absolute inset-x-0 bottom-6 flex justify-center">
        <span className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Scroll to enter</span>
      </div>
    </section>
  );
}
