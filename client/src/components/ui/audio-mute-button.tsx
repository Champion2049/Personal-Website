import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, isMuted } from '@/lib/grid-audio';

export function AudioMuteButton() {
  const [muted, setMuted] = useState(isMuted());

  useEffect(() => {
    const sync = (e: Event) => setMuted(!!(e as CustomEvent).detail?.muted);
    window.addEventListener('grid-audio-mute', sync as EventListener);
    return () => window.removeEventListener('grid-audio-mute', sync as EventListener);
  }, []);

  return (
    <button
      onClick={() => setMuted(toggleMute())}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      title={muted ? 'Unmute — End of Line' : 'Mute music'}
      className="grid place-items-center h-9 w-9 rounded-full border border-primary/30 text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
