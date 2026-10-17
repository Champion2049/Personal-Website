/**
 * Background-music controller for the "Get to know me" (Night City) page.
 * Plays /audio/end-of-line.mp3 on entry, fades in, and fades out + stops when
 * leaving for the professional site. Respects a user mute toggle.
 *
 * On a hard reload of the page there is no user gesture, so browsers block
 * autoplay. In that case we arm a one-time "unlock" listener that starts the
 * track on the visitor's first interaction (pointer / key / touch).
 *
 * NOTE: drop your own legally-obtained "End of Line" (Daft Punk, TRON: Legacy)
 * file at client/public/audio/ (the FLAC is the master; the site streams the ~4MB MP3) — it is not bundled for
 * copyright reasons. Any .flac at that path will play.
 */
const SRC = '/audio/end-of-line.mp3';
const TARGET_VOL = 0.55;

let audio: HTMLAudioElement | null = null;
let fadeRaf = 0;
let muted = false;
let active = false; // are we meant to be playing (i.e. on the page)?
let unlockArmed = false;

function ensure(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
  }
  return audio;
}

function cancelFade() {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  fadeRaf = 0;
}

function fadeTo(target: number, ms: number, onDone?: () => void) {
  const a = ensure();
  cancelFade();
  const start = a.volume;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    a.volume = Math.min(1, Math.max(0, start + (target - start) * k));
    if (k < 1) fadeRaf = requestAnimationFrame(step);
    else { fadeRaf = 0; onDone?.(); }
  };
  fadeRaf = requestAnimationFrame(step);
}

const unlockHandler = () => {
  disarmUnlock();
  if (active && !muted) attemptPlay();
};

function armUnlock() {
  if (unlockArmed) return;
  unlockArmed = true;
  window.addEventListener('pointerdown', unlockHandler);
  window.addEventListener('keydown', unlockHandler);
  window.addEventListener('touchstart', unlockHandler);
}

function disarmUnlock() {
  unlockArmed = false;
  window.removeEventListener('pointerdown', unlockHandler);
  window.removeEventListener('keydown', unlockHandler);
  window.removeEventListener('touchstart', unlockHandler);
}

function attemptPlay() {
  const a = ensure();
  a.play()
    .then(() => fadeTo(TARGET_VOL, 1300))
    .catch(() => armUnlock()); // autoplay blocked → start on first interaction
}

/** Start the track. Safe to call from a gesture handler or on page mount. */
export function playGridTrack() {
  active = true;
  if (muted) return;
  attemptPlay();
}

/** Fade out over ~1s and stop. */
export function stopGridTrack() {
  active = false;
  disarmUnlock();
  const a = audio;
  if (!a) return;
  fadeTo(0, 1000, () => { a.pause(); a.currentTime = 0; });
}

export function toggleMute(): boolean {
  muted = !muted;
  const a = audio;
  if (muted) {
    cancelFade();
    disarmUnlock();
    if (a) { a.volume = 0; a.pause(); }
  } else if (active) {
    attemptPlay();
  }
  window.dispatchEvent(new CustomEvent('grid-audio-mute', { detail: { muted } }));
  return muted;
}

export function isMuted() { return muted; }
