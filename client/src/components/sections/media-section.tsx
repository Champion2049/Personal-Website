import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, Star } from 'lucide-react';

interface AnimeData {
  title: string;
  image: string;
  status: 'Watching' | 'Completed';
  score: number;
  type: 'Anime';
  mal_url: string;
}

export function MediaSection() {
  const [media, setMedia] = useState<AnimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMalData = async () => {
      try {
        const response = await fetch('/api/mal');
        if (!response.ok) {
          throw new Error('Failed to fetch data from server.');
        }
        const data = await response.json();
        setMedia(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchMalData();
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
          <span className="text-white">Media</span> <span className="text-primary">Log</span>
        </motion.h2>
        
        {loading && <div className="text-center text-white">Loading MAL data...</div>}
        {error && <div className="text-center text-red-500">Error: {error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {media.map((item, index) => (
              <motion.a
                key={index}
                href={item.mal_url}
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
                  <img src={item.image} alt={item.title} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {item.status}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-primary flex-grow">{item.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-muted-foreground">
                      <Tv className="h-4 w-4 mr-2" />
                      <span>{item.type}</span>
                    </div>
                    {item.score > 0 && (
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="font-bold">{item.score}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
