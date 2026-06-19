import { motion } from 'framer-motion';
import { SiSpotify } from 'react-icons/si';
import { useState, useEffect } from 'react';
import { Loader2, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SpotifyNowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

interface SpotifyTopArtist {
    name: string;
    url: string;
    image?: string;
    genres: string[];
}

export function SpotifySection() {
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [topArtists, setTopArtists] = useState<SpotifyTopArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        if (!nowPlaying) setIsLoading(true);
        
        const [nowPlayingResponse, topArtistsResponse] = await Promise.all([
            fetch('/api/spotify'),
            fetch('/api/spotify-stats')
        ]);

        if (!nowPlayingResponse.ok) {
          throw new Error('Failed to fetch Spotify now playing data');
        }
        if (!topArtistsResponse.ok) {
            throw new Error('Failed to fetch Spotify top artists data');
        }

        const nowPlayingData = await nowPlayingResponse.json();
        const topArtistsData = await topArtistsResponse.json();

        setNowPlaying(nowPlayingData);
        setTopArtists(topArtistsData);

      } catch (error) {
        console.error(error);
        setNowPlaying({ isPlaying: false, title: "Spotify API Error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotifyData();
    const interval = setInterval(fetchSpotifyData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [nowPlaying]);

  const renderNowPlaying = () => {
    if (isLoading) {
      return (
        <div className="flex items-center">
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
        </div>
      );
    }

    if (!nowPlaying || !nowPlaying.title) {
        return (
             <div className="flex items-center w-full">
                <SiSpotify className="text-gray-500 mr-4 flex-shrink-0" size={40} />
                <p className="text-lg text-muted-foreground">Nothing to show right now.</p>
            </div>
        )
    }

    return (
      <a 
        href={nowPlaying.songUrl || 'https://open.spotify.com/user/31k76x23j55ygnc4myz53h4j3yma'} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
      >
        <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={nowPlaying.albumImageUrl || '/projects/placeholder.png'} alt={nowPlaying.album || 'Album Art'} className="w-24 h-24 rounded-md" />
            </div>
            <div className="ml-6 flex-grow min-w-0">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <SiSpotify className={nowPlaying.isPlaying ? "text-green-500 mr-2" : "text-gray-500 mr-2"} />
                <span>{nowPlaying.isPlaying ? 'Currently Listening' : 'Last Listened'}</span>
              </div>
              <h3 className="text-2xl font-bold text-primary truncate" title={nowPlaying.title}>{nowPlaying.title}</h3>
              <p className="text-muted-foreground truncate" title={nowPlaying.artist}>{nowPlaying.artist}</p>
            </div>
        </div>
      </a>
    );
  };

  const renderTopArtists = () => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-card p-4 rounded-lg animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-neutral-800 mx-auto mb-4"></div>
                        <div className="h-6 bg-neutral-700 rounded w-3/4 mx-auto"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (topArtists.length === 0) {
        return <p className="text-center text-muted-foreground">Could not load top artists.</p>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {topArtists.map((artist) => (
                <a href={artist.url} key={artist.name} target="_blank" rel="noopener noreferrer" className="block text-center bg-card p-4 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
                    <img src={artist.image || '/projects/placeholder.png'} alt={artist.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-transparent group-hover:border-primary transition-all duration-300" />
                    <h4 className="text-lg font-bold text-white truncate">{artist.name}</h4>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                        {artist.genres.map(genre => <Badge key={genre} variant="secondary" className="capitalize">{genre}</Badge>)}
                    </div>
                </a>
            ))}
        </div>
    )
  }

  return (
    <section id="spotify" className="py-20 bg-background">
      <div className="container mx-auto px-8">
        <motion.div
          className="max-w-md mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          {renderNowPlaying()}
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
            <h3 className="font-space text-4xl font-bold text-center mb-12 flex items-center justify-center text-white">
                <Music className="w-8 h-8 mr-4 text-primary"/>
                Top Artists This Month
            </h3>
            {renderTopArtists()}
        </motion.div>
      </div>
    </section>
  );
}
