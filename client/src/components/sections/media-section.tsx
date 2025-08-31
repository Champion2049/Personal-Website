import { motion } from 'framer-motion';
import { Tv, Star, Loader2, AlertTriangle, TrendingUp, CheckCircle, Clock, PauseCircle, XCircle, Calendar, List, Rewind, Eye, BookOpen, Book, FileText, Layers } from 'lucide-react';
import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TYPE DEFINITIONS ---
interface Media {
  mal_id: number;
  title: string;
  url:string;
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

interface MangaStats {
  days_read: number;
  mean_score: number;
  reading: number;
  completed: number;
  on_hold: number;
  dropped: number;
  plan_to_read: number;
  total_entries: number;
  reread: number;
  chapters_read: number;
  volumes_read: number;
}

interface UserFullProfile {
  statistics: {
    anime: AnimeStats;
    manga: MangaStats;
  };
}

interface FavoritesApiResponse {
  data: {
    anime: Media[];
    manga: Media[];
  };
}

interface StatsApiResponse {
  data: UserFullProfile;
}

// --- REUSABLE COMPONENTS ---
const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) => (
  <div className="bg-card p-4 rounded-lg flex items-center space-x-4 shadow-md transition-transform hover:scale-105">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const FavoriteMediaCard = ({ item, type }: { item: Media; type: 'Anime' | 'Manga' }) => (
  <motion.a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-card rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 flex overflow-hidden group"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
  >
    <img src={item.images.jpg.image_url} alt={item.title} className="w-24 h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
    <div className="p-3 flex flex-col flex-grow">
      <h3 className="text-md font-bold mb-2 text-primary flex-grow">{item.title}</h3>
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/10">
        <div className="flex items-center text-muted-foreground text-sm">
          {type === 'Anime' ? <Tv className="h-4 w-4 mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
          <span>{item.type}</span>
        </div>
        <div className="bg-yellow-400/80 text-black px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center">
          <Star className="h-3 w-3 mr-1" />
          Favorite
        </div>
      </div>
    </div>
  </motion.a>
);

const DialogMediaGrid = ({ items, type }: { items: Media[], type: 'Anime' | 'Manga' }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {items.map((item, index) => (
      <motion.a
        key={item.mal_id}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-card rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="relative">
          <img src={item.images.jpg.image_url} alt={item.title} className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-2 right-2 bg-yellow-400/80 text-black px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Favorite
          </div>
        </div>
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-1 text-primary flex-grow">{item.title}</h3>
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center text-muted-foreground text-sm">
              {type === 'Anime' ? <Tv className="h-4 w-4 mr-1" /> : <BookOpen className="h-4 w-4 mr-1" />}
              <span>{item.type}</span>
            </div>
          </div>
        </div>
      </motion.a>
    ))}
  </div>
);

// --- MAIN SECTION COMPONENT ---
export function MediaSection() {
  const [animeFavorites, setAnimeFavorites] = useState<Media[]>([]);
  const [mangaFavorites, setMangaFavorites] = useState<Media[]>([]);
  const [animeStats, setAnimeStats] = useState<AnimeStats | null>(null);
  const [mangaStats, setMangaStats] = useState<MangaStats | null>(null);
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

        if (!favoritesResponse.ok) throw new Error(`Failed to fetch favorites: ${favoritesResponse.statusText}`);
        if (!statsResponse.ok) throw new Error(`Failed to fetch stats: ${statsResponse.statusText}`);

        const favoritesData: FavoritesApiResponse = await favoritesResponse.json();
        const statsData: StatsApiResponse = await statsResponse.json();

        setAnimeFavorites(favoritesData.data.anime || []);
        setMangaFavorites(favoritesData.data.manga || []);
        setAnimeStats(statsData.data.statistics.anime);
        setMangaStats(statsData.data.statistics.manga);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderAnimeStats = () => (
    <div className="mb-12">
      <h3 className="font-space text-3xl font-bold text-center mb-8 text-white">Anime Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={<Eye className="h-8 w-8" />} label="Days Watched" value={animeStats!.days_watched.toFixed(2)} />
        <StatCard icon={<Star className="h-8 w-8" />} label="Mean Score" value={animeStats!.mean_score.toFixed(2)} />
        <StatCard icon={<CheckCircle className="h-8 w-8" />} label="Completed" value={animeStats!.completed} />
        <StatCard icon={<Clock className="h-8 w-8" />} label="Watching" value={animeStats!.watching} />
        <StatCard icon={<Calendar className="h-8 w-8" />} label="Plan to Watch" value={animeStats!.plan_to_watch} />
        <StatCard icon={<PauseCircle className="h-8 w-8" />} label="On Hold" value={animeStats!.on_hold} />
        <StatCard icon={<XCircle className="h-8 w-8" />} label="Dropped" value={animeStats!.dropped} />
        <StatCard icon={<List className="h-8 w-8" />} label="Total Entries" value={animeStats!.total_entries} />
        <StatCard icon={<Rewind className="h-8 w-8" />} label="Rewatched" value={animeStats!.rewatched} />
        <StatCard icon={<TrendingUp className="h-8 w-8" />} label="Episodes Watched" value={animeStats!.episodes_watched} />
      </div>
    </div>
  );

  const renderMangaStats = () => (
    <div className="mb-12">
      <h3 className="font-space text-3xl font-bold text-center mb-8 text-white">Manga Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={<Book className="h-8 w-8" />} label="Days Read" value={mangaStats!.days_read.toFixed(2)} />
        <StatCard icon={<Star className="h-8 w-8" />} label="Mean Score" value={mangaStats!.mean_score.toFixed(2)} />
        <StatCard icon={<CheckCircle className="h-8 w-8" />} label="Completed" value={mangaStats!.completed} />
        <StatCard icon={<Clock className="h-8 w-8" />} label="Reading" value={mangaStats!.reading} />
        <StatCard icon={<Calendar className="h-8 w-8" />} label="Plan to Read" value={mangaStats!.plan_to_read} />
        <StatCard icon={<PauseCircle className="h-8 w-8" />} label="On Hold" value={mangaStats!.on_hold} />
        <StatCard icon={<XCircle className="h-8 w-8" />} label="Dropped" value={mangaStats!.dropped} />
        <StatCard icon={<List className="h-8 w-8" />} label="Total Entries" value={mangaStats!.total_entries} />
        <StatCard icon={<Rewind className="h-8 w-8" />} label="Reread" value={mangaStats!.reread} />
        <StatCard icon={<FileText className="h-8 w-8" />} label="Chapters Read" value={mangaStats!.chapters_read} />
        <StatCard icon={<Layers className="h-8 w-8" />} label="Volumes Read" value={mangaStats!.volumes_read} />
      </div>
    </div>
  );

  const renderFavorites = (items: Media[], type: 'Anime' | 'Manga') => (
    <div>
      <h3 className="font-space text-3xl font-bold text-center mb-8 text-white">Top {type}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <FavoriteMediaCard key={item.mal_id} item={item} type={type} />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center h-48 bg-card/50 rounded-lg p-8">
            <p className="text-center text-muted-foreground">No {type.toLowerCase()} favorites found.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section id="media" className="py-20 bg-background">
      <div className="container mx-auto px-8">
        <motion.h2
          className="font-space text-5xl md:text-6xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="text-white">Animes &</span> <span className="text-primary">Mangas</span>
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

        {!isLoading && !error && animeStats && mangaStats && (
          <Tabs defaultValue="anime" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12 bg-card/50">
              <TabsTrigger value="anime">Anime</TabsTrigger>
              <TabsTrigger value="manga">Manga</TabsTrigger>
            </TabsList>
            
            <TabsContent value="anime">
              {renderAnimeStats()}
              {renderFavorites(animeFavorites, 'Anime')}
            </TabsContent>

            <TabsContent value="manga">
              {renderMangaStats()}
              {renderFavorites(mangaFavorites, 'Manga')}
            </TabsContent>

            <div className="text-center mt-16">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="font-space mr-4">
                    View More Favorites
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[90vh] bg-black border-2 border-primary/50 text-white flex flex-col shadow-lg shadow-primary/20">
                  <DialogHeader>
                    <DialogTitle className="font-space text-3xl text-primary">All Favorites</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Browse all my favorite Anime and Manga.
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="anime" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="mx-auto grid w-full grid-cols-2 max-w-sm bg-card/50">
                      <TabsTrigger value="anime">Anime</TabsTrigger>
                      <TabsTrigger value="manga">Manga</TabsTrigger>
                    </TabsList>
                    <TabsContent value="anime" className="overflow-y-auto flex-grow mt-4 pr-2">
                      <DialogMediaGrid items={animeFavorites} type="Anime" />
                    </TabsContent>
                    <TabsContent value="manga" className="overflow-y-auto flex-grow mt-4 pr-2">
                      {mangaFavorites.length > 0 ? (
                        <DialogMediaGrid items={mangaFavorites} type="Manga" />
                      ) : (
                        <p className="text-center text-muted-foreground mt-8">No manga favorites found.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="font-space">
                <a href="https://myanimelist.net/profile/Champion2049" target="_blank" rel="noopener noreferrer">
                  View MAL Profile
                </a>
              </Button>
            </div>
          </Tabs>
        )}
      </div>
    </section>
  );
}

