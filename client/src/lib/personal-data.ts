/**
 * ============================================================
 *  EDIT-ME: everything on the "Get to know me" page lives here.
 *  COVERS: /covers/<name>.jpg (see client/public/covers/README.txt).
 *  RATINGS: `rating` = personal score out of 10 (want-to-play is unrated).
 * ============================================================
 */

export const profiles = {
  spotify: 'https://open.spotify.com/user/31k76x23j55ygnc4myz53h4j3yma',
  myanimelist: 'https://myanimelist.net/profile/Champion2049',
  letterboxd: '',
};

export const now = {
  listening: 'Eyes Without a Face - Billy Idol',
  watching: 'The Mentalist',
  playing: 'Stellar Blade & 007 First Light',
  reading: 'None',
};

export const taste = [
  { label: 'Souls-likes', value: 95 },
  { label: 'Sci-fi & Cyberpunk', value: 92 },
  { label: 'Open-world RPGs', value: 88 },
  { label: 'Shonen / Action anime', value: 84 },
  { label: 'Electronic / Synthwave', value: 90 },
  { label: 'Psychological thrillers', value: 78 },
];

export interface RankItem {
  title: string;
  note?: string;
  year?: string;
  cover?: string;
  rating?: number; // personal score out of 10
}

export const movies: RankItem[] = [
  { title: 'Interstellar', year: '2014', rating: 9.6, note: 'Mankind was born on Earth. It was never meant to die here.', cover: '/covers/interstellar.jpg' },
  { title: 'Blade Runner 2049', year: '2017', rating: 9.2, note: 'You look lonely. I can fix that.', cover: '/covers/blade-runner.jpg' },
  { title: 'The Dark Knight', year: '2008', rating: 9.4, note: 'Why do we fall, sir? So that we can learn to pick ourselves up.', cover: '/covers/dark-knight.jpg' },
  { title: 'Tron: Legacy', year: '2010', rating: 9.0, note: "Greetings Programs!", cover: '/covers/tron.jpg' },
  { title: 'Spider-Man: Across the Spider-Verse', year: '2018', rating: 8.8, note: "Nah, I'mma do my own thing", cover: '/covers/spider-verse.jpg' },
  { title: 'The Prestige', year: '2010', rating: 9.1, note: 'The magician takes the ordinary something and makes it do something extraordinary.', cover: '/covers/the-prestige.jpg' },
];

export interface GameItem {
  title: string;
  cover?: string;
  tags?: string[];
  note?: string;
  rating?: number; // personal score out of 10
}

export const favouriteGame: GameItem = {
  title: 'Cyberpunk 2077',
  note: 'GOOOOOOOOOD MORNING NIGHT CITY!',
  tags: ['All-time favourite', 'Replayed it', 'Would love to discuss'],
  cover: '/covers/cyberpunk-2077.jpg',
  rating: 9.8,
};

export const gamesILike: GameItem[] = [
  { title: 'Sekiro: Shadows Die Twice', cover: '/covers/sekiro.jpg', rating: 9.6 },
  { title: 'Elden Ring: Nightreign', cover: '/covers/elden-ring-nightreign.jpg', rating: 9.2 },
  { title: 'Elden Ring', cover: '/covers/elden-ring.jpg', rating: 9.7 },
  { title: 'Call of Duty: Infinite Warfare', cover: '/covers/infinite-warfare.jpg', rating: 9.6 },
  { title: 'Hitman', cover: '/covers/hitman.jpg', rating: 9.5 },
  { title: 'Red Dead Redemption 2', cover: '/covers/rdr2.jpg', rating: 9.4 },
  { title: 'Expedition 33', cover: '/covers/expedition-33.jpg', rating: 9.0 },
  { title: 'Detroit: Become Human', cover: '/covers/detroit.jpg', rating: 8.9 },
  { title: 'Grand Theft Auto V', cover: '/covers/gta-v.jpg', rating: 9.2 },
  { title: 'Batman: Arkham Knight', cover: '/covers/batman.jpg', rating: 9.0 },
  { title: 'Dying Light', cover: '/covers/dying-light.jpg', rating: 9.3 },
  { title: 'Resident Evil 4: Remake', cover: '/covers/re4.jpg', rating: 9.1 },
  { title: 'Forza Horizon 6', cover: '/covers/fh6.jpg', rating: 8.6 },
  { title: 'Subnautica 1 & 2', cover: '/covers/subnautica.jpg', rating: 9.2 },
  { title: 'Devil May Cry 5', cover: '/covers/dmc5.jpg', rating: 8.5 },
  { title: '007 First Light', cover: '/covers/first-light.jpg', rating: 8.0 },
  { title: 'Phasmophobia', cover: '/covers/phasmophobia.jpg', rating: 8.4 },
  { title: 'Dead Island 2', cover: '/covers/di2.jpg', rating: 7.5 },
];

export const wantToPlay: GameItem[] = [
  { title: 'Resident Evil: Requiem', cover: '/covers/re9.jpg' },
  { title: 'Hollow Knight', cover: '/covers/hollow-knight.jpg' },
  { title: 'Hollow Knight: Silksong', cover: '/covers/silksong.jpg' },
  { title: 'Battlefield 6', cover: '/covers/bf6.jpg' },
  { title: 'Helldivers II', cover: '/covers/hd2.jpg' },
  { title: 'Death Stranding 2: On the Beach', cover: '/covers/ds2.jpg' }
];

export const tvShows: RankItem[] = [
  { title: 'Brooklyn 99', year: '2013', rating: 9.8, note: 'NINE-NINE!', cover: '/covers/b99.jpg' },
  { title: 'Love Death + Robots', year: '2019', rating: 9.7, note: 'I had to make a wee sacrifice to the great nothing.', cover: '/covers/ldr.jpg' },
  { title: 'Cyberpunk: Edgerunners', year: '2022', rating: 9.3, note: 'Sorry, wish we could go to the moon together.', cover: '/covers/edgerunners.jpg' },
  { title: 'From', year: '2022', rating: 9.0, note: "It's hard to see the sweater when you're only just a thread.", cover: '/covers/from.jpg' },
  { title: 'The Mentalist', year: '2008', rating: 9.2, note: "When you're dead, you're dead, and until then there's ice cream.", cover: '/covers/mentalist.jpg' },
  { title: 'Arcane', year: '2021', rating: 9.1, note: 'Animation as a flex.', cover: '/covers/arcane.jpg' },
];

/* ============================================================
   COMPATIBILITY QUIZ — edit freely. Mark the option that's *my*
   pick with `mine: true`. `reveal` shows after the visitor answers.
   ============================================================ */
export interface QuizOption { text: string; mine?: boolean }
export interface QuizQuestion { q: string; options: QuizOption[]; reveal: string }

export const quiz: QuizQuestion[] = [
  {
    q: 'Free weekend. What are you firing up first?',
    options: [
      { text: 'A brutal Souls-like boss on attempt #47', mine: true },
      { text: 'A cozy farming / life sim' },
      { text: 'A ranked FPS grind' },
      { text: 'A slow, story-rich narrative game', mine: true },
    ],
    reveal: 'Souls-like gets me going, but so does a story-rich game. Depends on my mood ;)',
  },
  {
    q: 'Pick a movie night.',
    options: [
      { text: 'Cerebral sci-fi that bends time & space', mine: true },
      { text: 'A feel-good rom-com' },
      { text: 'Gory slasher horror', mine: true },
      { text: 'A hard-hitting documentary' },
    ],
    reveal: 'Sci-fi is my comfort food, and a gory horror is a guilty pleasure.',
  },
  {
    q: 'Soundtrack to your life is…',
    options: [
      { text: 'Synthwave / electronic (Daft Punk on repeat)', mine: true },
      { text: 'Lo-fi beats to chill to' },
      { text: 'Classic rock' },
      { text: 'Whatever’s topping the charts', mine: true },
    ],
    reveal: 'Synthwave just hits different, but hey so does Phonk and Pop. I have eclectic tastes.',
  },
  {
    q: 'Where does your anime taste land?',
    options: [
      { text: 'Action & Shonen', mine: true },
      { text: 'Pure Slice-of-Life & Romance' },
      { text: 'Comfort-food isekai', mine: true },
      { text: 'Anime isn’t really my thing' },
    ],
    reveal: 'Big fights, bigger feelings and maybe a comfort isekai to wind down.',
  },
  {
    q: 'What hooks you in a story?',
    options: [
      { text: 'A psychological twist that reframes everything', mine: true },
      { text: 'Wholesome character growth' },
      { text: 'Epic large-scale battles' },
      { text: 'A tight whodunit mystery', mine: true },
    ],
    reveal: "Who doesn't love a good plot twist? But like a mystery is a close second.",
  },
  {
    q: 'Choose a world to actually live in.',
    options: [
      { text: 'A rain-soaked neon cyberpunk megacity', mine: true },
      { text: 'A sweeping high-fantasy realm', mine: true },
      { text: 'A frontier space colony' },
      { text: 'Honestly, present-day Earth is fine' },
    ],
    reveal: 'Chonqing China you feel me? But like imagines castles and magic and dragons and stuff. Both sound fun ngl.',
  },
];
