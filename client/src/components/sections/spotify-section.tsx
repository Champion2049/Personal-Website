import { motion } from 'framer-motion';
import { SiSpotify } from 'react-icons/si';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

export function SpotifySection() {
  const [data, setData] = useState<SpotifyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/spotify');
        if (!response.ok) {
          throw new Error('Failed to fetch Spotify data');
        }
        const spotifyData = await response.json();
        setData(spotifyData);
      } catch (error) {
        console.error(error);
        setData({ isPlaying: false }); // Set a default state on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="spotify" className="py-20 bg-background">
      <div className="container mx-auto px-8">
        <motion.h2
          className="font-space text-5xl md:text-6xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="text-white">Now</span> <span className="text-primary">Playing</span>
        </motion.h2>
        
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <a 
            href={data?.isPlaying ? data.songUrl : 'https://open.spotify.com/user/31k76x23j55ygnc4myz53h4j3yma'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {isLoading ? (
                  <div className="w-24 h-24 rounded-md bg-neutral-800 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <img src={data?.isPlaying ? data.albumImageUrl : '/projects/placeholder.png'} alt="Album Art" className="w-24 h-24 rounded-md" />
                )}
              </div>
              <div className="ml-6 flex-grow min-w-0">
                {isLoading ? (
                  <div>
                    <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-neutral-800 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                  </div>
                ) : data?.isPlaying ? (
                  <>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <SiSpotify className="text-green-500 mr-2" />
                      <span>Currently Listening</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary truncate" title={data.title}>{data.title}</h3>
                    <p className="text-muted-foreground truncate" title={data.artist}>{data.artist}</p>
                  </>
                ) : (
                  <div className="flex items-center">
                    <SiSpotify className="text-gray-500 mr-3" />
                    <p className="text-lg text-muted-foreground">Not currently listening</p>
                  </div>
                )}
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
