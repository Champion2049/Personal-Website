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
        // Don't set loading to true on interval fetches
        if (!data) setIsLoading(true);
        
        const response = await fetch('/api/spotify');
        if (!response.ok) {
          throw new Error('Failed to fetch Spotify data');
        }
        const spotifyData = await response.json();
        setData(spotifyData);
      } catch (error) {
        console.error(error);
        setData({ isPlaying: false, title: "Spotify API Error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-md bg-neutral-800 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <div className="ml-6 flex-grow min-w-0">
            <div>
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-6 bg-neutral-800 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </>
      );
    }

    if (!data || !data.title) {
        return (
             <div className="flex items-center w-full">
                <SiSpotify className="text-gray-500 mr-4 flex-shrink-0" size={40} />
                <p className="text-lg text-muted-foreground">Nothing to show right now.</p>
            </div>
        )
    }

    return (
      <>
        <div className="flex-shrink-0">
          <img src={data.albumImageUrl || '/projects/placeholder.png'} alt={data.album || 'Album Art'} className="w-24 h-24 rounded-md" />
        </div>
        <div className="ml-6 flex-grow min-w-0">
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <SiSpotify className={data.isPlaying ? "text-green-500 mr-2" : "text-gray-500 mr-2"} />
            <span>{data.isPlaying ? 'Currently Listening' : 'Last Listened'}</span>
          </div>
          <h3 className="text-2xl font-bold text-primary truncate" title={data.title}>{data.title}</h3>
          <p className="text-muted-foreground truncate" title={data.artist}>{data.artist}</p>
        </div>
      </>
    );
  };

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
            href={data?.songUrl || 'https://open.spotify.com/user/31k76x23j55ygnc4myz53h4j3yma'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="flex items-center">
              {renderContent()}
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
