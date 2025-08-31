import { motion } from 'framer-motion';
import { Tv, Star } from 'lucide-react';

const mediaData = [
  {
    title: 'Attack on Titan',
    image: 'https://cdn.myanimelist.net/images/anime/10/47347.webp',
    status: 'Completed',
    score: 9.09,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/16498/Shingeki_no_Kyojin',
  },
  {
    title: 'Jujutsu Kaisen',
    image: 'https://cdn.myanimelist.net/images/anime/1171/109222.webp',
    status: 'Watching',
    score: 8.68,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/40748/Jujutsu_Kaisen_TV',
  },
  {
    title: 'Steins;Gate',
    image: 'https://cdn.myanimelist.net/images/anime/5/73199.webp',
    status: 'Completed',
    score: 9.08,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/9253/Steins_Gate',
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    image: 'https://cdn.myanimelist.net/images/anime/1223/96541.webp',
    status: 'Completed',
    score: 9.13,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/5114/Fullmetal_Alchemist__Brotherhood',
  },
  {
    title: 'Hunter x Hunter (2011)',
    image: 'https://cdn.myanimelist.net/images/anime/11/33657.webp',
    status: 'Completed',
    score: 9.04,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/11061/Hunter_x_Hunter_2011',
  },
  {
    title: 'Vinland Saga',
    image: 'https://cdn.myanimelist.net/images/anime/1500/103005.webp',
    status: 'Watching',
    score: 8.76,
    type: 'Anime',
    mal_url: 'https://myanimelist.net/anime/37521/Vinland_Saga',
  },
];

export function MediaSection() {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {mediaData.map((item, index) => (
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
      </div>
    </section>
  );
}
