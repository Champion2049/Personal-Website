import { motion } from 'framer-motion';
import { SiSpotify } from 'react-icons/si';

// This is a placeholder. In a real application, you would fetch this data from the Spotify API.
const spotifyData = {
  isPlaying: true,
  song: 'Glimpse of Us',
  artist: 'Joji',
  albumArt: '/projects/placeholder.png', // Placeholder image
  songUrl: 'https://open.spotify.com/track/6xKCYgH1figvppcFXjwpfO',
};

export function SpotifySection() {
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
            href={spotifyData.isPlaying ? spotifyData.songUrl : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* Placeholder for Album Art */}
                <img src={spotifyData.albumArt} alt="Album Art" className="w-24 h-24 rounded-md" />
              </div>
              <div className="ml-6 flex-grow">
                {spotifyData.isPlaying ? (
                  <>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <SiSpotify className="text-green-500 mr-2" />
                      <span>Currently Listening</span>
                    </div>
                    <h3 className="text-2xl font-bold text-primary">{spotifyData.song}</h3>
                    <p className="text-muted-foreground">{spotifyData.artist}</p>
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
