import { motion } from 'framer-motion';
import { Tv, Star, Loader2, AlertTriangle, TrendingUp, CheckCircle, Clock, PauseCircle, XCircle, Calendar, List, Rewind, Eye } from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

// Types for API responses
interface Anime {
  mal_id: number;
  title: string;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  type: string;
}

interface AnimeStats {
  days_watched: number;
  mean_score: number;
  watching: number;
  completed: number;
  on_hold: number;
  dropped: number;
  plan_to_watch: number;
  total_entries: number;
  rewatched: number;
  episodes_watched: number;
}

interface UserFullProfile {
  statistics: {
    anime: AnimeStats;
  };
}

interface FavoritesApiResponse {
  data: {
    anime: Anime[];
  };
}

interface StatsApiResponse {
  data: UserFullProfile;
}

const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) => (
  <div className="bg-card p-4 rounded-lg flex items-center space-x-4 shadow-md transition-transform hover:scale-105">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);


export function MediaSection() {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [stats, setStats] = useState<AnimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [favoritesResponse, statsResponse] = await Promise.all([
          fetch('/api/mal-favorites'),
          fetch('/api/mal-stats')
        ]);

        if (!favoritesResponse.ok) {
          throw new Error(`Failed to fetch favorites: ${favoritesResponse.statusText}`);
        }
        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);
        }

        const favoritesData: FavoritesApiResponse = await favoritesResponse.json();
        const statsData: StatsApiResponse = await statsResponse.json();

        setFavorites(favoritesData.data.anime.slice(0, 6));
        setStats(statsData.data.statistics.anime);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section id="media" className="py-20 bg-background">
      <div className="container mx-auto px-8">
        <motion.h2
          className="font-space text-5xl md:text-6xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="text-white">My</span> <span className="text-primary">Animes</span>
        </motion.h2>
        
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-96 bg-destructive/10 text-destructive p-8 rounded-lg">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Failed to Load MyAnimeList Data</h3>
            <p className="text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && stats && (
          <>
            <div className="mb-16">
              <h3 className="font-space text-3xl font-bold text-center mb-8 text-white">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard icon={<Eye className="h-8 w-8" />} label="Days Watched" value={stats.days_watched.toFixed(2)} />
                <StatCard icon={<Star className="h-8 w-8" />} label="Mean Score" value={stats.mean_score.toFixed(2)} />
                <StatCard icon={<CheckCircle className="h-8 w-8" />} label="Completed" value={stats.completed} />
                <StatCard icon={<Clock className="h-8 w-8" />} label="Watching" value={stats.watching} />
                <StatCard icon={<Calendar className="h-8 w-8" />} label="Plan to Watch" value={stats.plan_to_watch} />
                <StatCard icon={<PauseCircle className="h-8 w-8" />} label="On Hold" value={stats.on_hold} />
                <StatCard icon={<XCircle className="h-8 w-8" />} label="Dropped" value={stats.dropped} />
                <StatCard icon={<List className="h-8 w-8" />} label="Total Entries" value={stats.total_entries} />
                <StatCard icon={<Rewind className="h-8 w-8" />} label="Rewatched" value={stats.rewatched} />
                <StatCard icon={<TrendingUp className="h-8 w-8" />} label="Episodes Watched" value={stats.episodes_watched} />
              </div>
            </div>

            <h3 className="font-space text-3xl font-bold text-center mb-8 text-white">My Favorites</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {favorites.map((item, index) => (
                <motion.a
                  key={item.mal_id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col overflow-hidden group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  <div className="relative">
                    <img src={item.images.jpg.image_url} alt={item.title} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute top-2 right-2 bg-yellow-400/80 text-black px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Favorite
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-primary flex-grow">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-muted-foreground">
                        <Tv className="h-4 w-4 mr-2" />
                        <span>{item.type}</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </>
        )}

        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className="font-space">
            <a href="https://myanimelist.net/profile/Champion2049" target="_blank" rel="noopener noreferrer">
              View MAL Profile
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

