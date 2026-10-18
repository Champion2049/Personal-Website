/**
 * ============================================================
 *  BLOG — add posts as you write them.
 *  Each post is plain Markdown in the `content` field. Newest first
 *  (or set `date` and they'll sort by date automatically).
 *
 *  To add a post: copy a block below, give it a unique `slug`
 *  (used in the URL: /blog/<slug>), a title, date (YYYY-MM-DD),
 *  a short excerpt, optional tags, and write the body in Markdown.
 * ============================================================
 */
export interface BlogPost {
  slug: string;
  title: string;
  date: string;        // YYYY-MM-DD
  excerpt: string;
  tags?: string[];
  content: string;     // Markdown
}

export const posts: BlogPost[] = [
  {
    slug: 'rendering-night-city-in-blender',
    title: 'Rendering Night City without opening Blender',
    date: '2026-10-18',
    excerpt: 'The flythrough on my Get to know me page is a procedural city, built and rendered from one Python file.',
    tags: ['Blender', 'Python', 'Graphics'],
    content: `The first thing you see on the Night City side of this site is a flight down a rain-soaked street that climbs past the last towers to a huge NIGHT CITY sign. No 3D engine runs in your browser for it. It's a short video, and the video comes out of a single Python script that drives Blender.

## Why prerender at all

A real-time WebGL city would look worse and cost more. Every visitor's GPU would pay for it, phones would heat up, and I'd be fighting shader budgets instead of making the place look good. A prerendered shot gets path-traced light, haze and proper wet-road reflections, and the browser only has to show frames.

## A city made of code

\`night_city_flythrough.py\` uses \`bpy\`, Blender's Python module (it installs with pip), and runs headless with Cycles on the CPU. There are no imported models. Everything is generated:

- towers with procedural windows, fire escapes, pipes and grime
- a market strip with awnings, bulb strings, vending machines and steam
- pedestrians, some under LED umbrellas
- an elevated rail with a train, flying cars and street traffic
- neon signs and billboards, set in two open-licence fonts

The camera, the train, the flicker on the signs, the rain: every moving thing is a pure function of the frame number. That sounds like a technicality, but it's what lets the page scrub the shot backwards without anything jumping.

## A dull city, vivid light

The reference I kept coming back to is Night City in the rain. The buildings are grey, brown and filthy. All the colour comes from light: neon, screens, lamps, and their reflections in the road. So the materials are deliberately dull (wet concrete, masonry, grey-teal smog) and only the light sources carry the palette.

## Two renders per frame

Fog is the expensive part of a shot like this, so each frame is rendered twice:

1. **Beauty**: the city itself in Cycles.
2. **Volume**: the same scene at a quarter of the resolution, every surface black, with a smog volume switched on. All it captures is light scattered in the air: sign halos, lamp cones, lit steam.

Fog is soft and low-detail, so the low-res pass loses nothing you'd notice. A post step stacks the two and adds bloom, streaks, a little chromatic aberration, the grade and a vignette.

\`\`\`bash
# six frames to judge the look before committing to a full run
python night_city_flythrough.py look --res desktop --frames 240 --out /tmp/nc/look

# the full shot: both passes, then post and encode
python night_city_flythrough.py render --res desktop --frames 240 --pass beauty --out /tmp/nc/d/beauty
python night_city_flythrough.py render --res desktop --frames 240 --pass volume --out /tmp/nc/d/volume
python night_city_flythrough.py post --src /tmp/nc/d --dst /tmp/nc/d/post --size 1280x720
python night_city_flythrough.py encode --src /tmp/nc/d/post --dst nc-desktop.mp4 --crf 28
\`\`\`

The \`look\` command earned its keep. Six frames render in about a minute, so most of the work on the city happened six frames at a time.

Phones get their own render. A portrait screen isn't a cropped landscape one, so the camera is re-framed and the shot rendered again at 540×960.

## What I'd do again

- **Generate, don't model.** When something looked off I changed a number and re-rendered, instead of nudging objects around by hand.
- **Check stills before motion.** A billboard that rendered as a blank red rectangle made it into the first cut. A contact sheet of six frames would have caught it immediately.
- **Keep an escape hatch.** The script can save the generated scene as a \`.blend\`, so I can still open it in Blender's UI and poke around.`,
  },
  {
    slug: 'scroll-scrubbing-video',
    title: 'Scroll-scrubbing a video instead of 120 images',
    date: '2026-10-18',
    excerpt: 'Swapping an image sequence for one small H.264 file made the Night City flythrough lighter and smoother. The catch is in how you seek.',
    tags: ['Web', 'Performance', 'Video'],
    content: `The Night City arrival is an Apple-style scroll scene: the section pins, and scrolling flies a camera through the city. The first version did it the usual way, with an image sequence. It's one video file now. Here's why, and the few details that make video scrubbing work.

## Version one: frames

120 WebP frames for desktop (4.7 MB) and 90 for phones (2.3 MB), decoded off the main thread into a small buffer around the current scroll position and drawn to a canvas.

It worked, but:

- every frame is its own request and its own decode
- a decoded 1280×720 frame takes about 3.7 MB of memory, however little the WebP weighed
- with only 120 frames, a slow scroll visibly stepped. I tried blending neighbouring frames to hide it and got ghosting instead: two half-transparent cities on top of each other.

## Version two: a video

A video codec is built for exactly this: consecutive frames that are nearly identical. The same shot as H.264 came out at 2.7 MB for desktop and 1.35 MB for phones. The browser's hardware decoder does the work, and only the current frame is held in memory. That headroom paid for the next render: twice the frames and a much busier street, in 3.5 MB.

The catch is seeking. Video is stored as keyframes plus differences, so to show a frame the decoder starts from the previous keyframe and works forward. Normal video has keyframes seconds apart, which makes scrubbing backwards stutter. So this encode has one every six frames:

\`\`\`bash
ffmpeg -framerate 30 -i post/%04d.png -an -pix_fmt yuv420p -g 6 -keyint_min 6 \\
  -c:v libx264 -profile:v high -preset slow -crf 28 \\
  -sc_threshold 0 -movflags +faststart nc-desktop.mp4
\`\`\`

## Three details that matter

**Fetch the whole file first.** The video is downloaded into a blob and played from an object URL. Otherwise a seek can turn into a range request, and scrubbing waits on the network.

**Queue the seeks.** Setting \`currentTime\` on every scroll event floods the decoder. Instead there's one seek in flight at a time, and when it lands the player jumps to wherever the scroll has got to by then:

\`\`\`ts
const seek = (v: HTMLVideoElement) => {
  if (v.seeking || v.readyState < 1 || !v.duration) return;
  const t = Math.max(0, Math.min(progress.current * v.duration, v.duration - 0.001));
  if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
};
video.addEventListener('seeked', () => seek(video));
\`\`\`

**Play it once on iOS.** iPhones won't decode frames for seeking until a video has played, so once the file has loaded the player calls \`play()\` and immediately \`pause()\`.

There's also a VP9 WebM next to the MP4, chosen with \`canPlayType\`, for browser builds that ship without H.264. With reduced motion on, you get the poster image and no pinning at all.

## Worth it?

A smaller download, a smoother scrub, far less memory, and simpler code: no worker, no canvas, no frame buffer. The one cost is a bigger file than a normal video of the same length, because of all those keyframes. For a scroll scene that's the right trade.`,
  },
  {
    slug: 'chids-fm-equalizer',
    title: 'A real equalizer for a fake radio station',
    date: '2026-10-18',
    excerpt: "Chids FM's bars used to be a looping CSS animation. Now they read the actual audio, which took one Web Audio quirk to get right.",
    tags: ['Web Audio', 'Canvas', 'Night City'],
    content: `The Night City page has a soundtrack and a pretend radio station called Chids FM. For a long time its equalizer was a CSS animation: bars bouncing on a loop, unrelated to whatever was playing. That always bugged me, so now it listens.

## Getting at the audio

The Web Audio API has an \`AnalyserNode\` that gives you the frequency spectrum of whatever flows through it. To use it, you route the page's \`<audio>\` element into an \`AudioContext\`:

\`\`\`ts
const ctx = new AudioContext();
const src = ctx.createMediaElementSource(audio);
const analyser = ctx.createAnalyser();
analyser.fftSize = 256;
analyser.smoothingTimeConstant = 0.8;
src.connect(analyser);
analyser.connect(ctx.destination);
\`\`\`

## The quirk

\`createMediaElementSource\` is a one-way door. Once an element is routed into a context it can't be taken back out, and from then on its sound only reaches your speakers through that context. Browsers keep a new \`AudioContext\` suspended until the visitor has interacted with the page. Route the element too early and the music goes silent.

So the analyser is created lazily: only once the track is actually playing and \`navigator.userActivation.hasBeenActive\` says the visitor has clicked, tapped or typed something. Until then the bars sit still.

## Drawing it

- An \`fftSize\` of 256 gives 128 frequency bins.
- Those are grouped into 48 bars, narrow groups at the low end and wide ones at the top, so the bass doesn't get one bar while the hiss gets thirty.
- Each bar goes through \`Math.pow(v, 1.6)\`. Raw values make everything hover around the middle; the curve lets peaks stand out.
- The canvas draws at 30 fps, and only while the music is playing and the radio is on screen.

## Being honest about it

Chids FM also shows what I'm listening to on Spotify, but the bars don't react to that. Spotify's API tells you the track, not the audio. They react to the page's own soundtrack, and the caption under them says so.`,
  },
  {
    slug: 'making-night-city-fast',
    title: 'Making Night City fast again',
    date: '2026-10-17',
    excerpt: 'The Night City page had become laggy. Most of the cost turned out to be things nobody was looking at.',
    tags: ['Performance', 'Web', 'CSS'],
    content: `After a few rounds of adding effects, the Night City page had got noticeably laggy, especially while scrolling. Rather than guess, I wrote a small Playwright script that loads the page, sits idle, then scrolls through every section while recording long frames and main-thread time. Then I ran it against the current build and the last one that felt fine.

The idle number was the embarrassing one: **41–51% of the main thread busy while the page was doing nothing**. After the fixes below, it's 2–3%.

## What was actually expensive

**A blurred image that moved.** My favourite-game card had blurred key art behind it, drifting with a parallax effect. A still blur is cheap because the browser can cache it. Move it, and it's re-filtered every frame. On the same scripted scroll, that one layer accounted for most of the extra slow frames. It doesn't move any more.

**A grid that redrew itself.** The Tron floor behind the page repainted its whole canvas every frame, fade and all. Now the static part is drawn once on its own canvas, and each frame only strokes about thirty short rows. On Night City it doesn't animate at all.

**Rain that never stopped.** The rain canvas ran all the time. Now it only falls while you scroll, builds with your scroll speed and fades out when you stop. It's drawn at full resolution: a half-resolution canvas stretched to fit was cheaper to draw but cost more to composite, especially on machines compositing in software.

**Hundreds of megabytes of frames.** The flythrough was still an image sequence then, and decoding every frame up front meant about 440 MB of 720p bitmaps fighting over the image cache. Decoding off the main thread, and only keeping a window around the current frame, fixed that. (It has since become a video, which is better still.)

**Animations nobody could see.** Small infinite CSS loops (pulsing dots, an equalizer, the arcade's attract screen) kept running in sections far off-screen. My first fix set a \`data-offscreen\` attribute and paused them with a selector. That forced a style recalculation of the whole section every time it crossed the viewport, which showed up as a spike of its own. The version that stuck goes through the Web Animations API:

\`\`\`ts
const loops = (el: Element) =>
  el.getAnimations({ subtree: true }).filter(
    (a) => a.effect?.getTiming().iterations === Infinity && 'animationName' in a,
  );

// in an IntersectionObserver, per section
const run = entry.isIntersecting;
loops(entry.target).forEach((a) => (run ? a.play() : a.pause()));
\`\`\`

Pausing an Animation object doesn't touch the style system at all.

**Canvases running flat out.** Every canvas effect now draws at 30 fps at most and stops entirely when it leaves the screen.

## The same lesson, once more

When I added the stacked project case files to the main page, the trace lit up again: 29 to 55 slow frames per pass, against 0 to 2 before. Each case file has a live canvas, and the stack shrinks the file underneath as the next one slides over it. Scaling a layer that holds a canvas forces it to be redrawn every frame. The fix was to hand the "live" state to the incoming file as soon as it appears, and hide the canvases of files that are fully covered. Back to zero.

## Rules I follow now

- On anything that moves while you scroll, animate \`transform\` and \`opacity\` and nothing else.
- Never move a blurred layer. Blur it once and leave it.
- Don't scale or stretch layers that contain canvases.
- If it's off-screen, it shouldn't be running.
- Measure against the previous build, not against a feeling.`,
  },
  {
    slug: 'cutting-the-small-text',
    title: 'Cutting the small text',
    date: '2026-10-17',
    excerpt: 'My portfolio had started to look machine-made. The fix was mostly deletion.',
    tags: ['Design', 'UI'],
    content: `At some point the main site crossed a line. Every section had a number and a small monospace label above its heading. There was a ruler down the side of the screen, coordinates in the corner and a live clock. Each piece was harmless on its own. Together they made the page look generated rather than designed, and they buried the things people actually come for.

So I did a pass with one rule: if nobody reads it, it goes.

## What went

- **Section numbers and the labels above headings.** The heading already says what the section is.
- **The HUD ruler, side letters, coordinates and clock.** The scroll progress line stayed, because it tells you something.
- **The skills grid.** Six cards of chips, a two-row ticker and a separate strip of domains, with the same names repeated across all three.

## What replaced it

Skills are now four short lines, grouped the way my résumé groups them: languages, ML & AI, domains, and systems & tools. One slow ticker row stayed, because a little motion is nice. GitHub stats became four plain numbers. Publications lead with the journal name, since that's what a reader is scanning for.

## What stayed

The personality didn't have to go with the clutter. The hero's letters still lift towards your cursor, and a light cycle still rips the page open when you scroll. The cursor still locks onto cards. Projects still slide past sideways. The difference is that each section has one interesting thing going on instead of six small ones.

## A test I'll keep using

Squint at the page. If what you see is a texture of tiny grey text, something needs to go. If you see a few big shapes and one thing moving, it's probably fine.`,
  },
  {
    slug: 'building-this-portfolio',
    title: 'Building a Tron-meets-Night-City portfolio',
    date: '2026-06-15',
    excerpt: 'Why I rebuilt my site around a dual identity — a clean technical front, and a neon alter-ego one click away.',
    tags: ['Design', 'React', 'Side project'],
    content: `When I set out to rebuild this site, I wanted two things that usually fight each other: a portfolio a recruiter takes seriously, and something that actually feels like *me*.

So I split it in two. The main site is deliberately restrained — dark, gridded, mono accents, the kind of page that gets out of the way of the work. Then there's a door labelled **Get to know me** that drops you through a light-cycle transition into "Night City": a cyberpunk-red alter-ego with my games, films, shows and a playable mini-game.

## A few things I'm happy with

- A single \`enter-grid\` event drives the whole transition, so the bike animation, the colour morph and the route change stay in sync.
- The cover art, ratings and rankings are all data-driven — one file, no JSX surgery to add a movie.
- The cursor itself morphs cyan to crimson as you cross over. Small detail, but it sells the "two worlds" idea.

## What I'd tell past me

> Build the data layer first. Every "can you also add…" became a one-line edit instead of a refactor.

More to come — I'll write up the light-cycle game and the live Spotify/MAL integration next.`,
  },
  {
    slug: 'mcp-server-lessons',
    title: 'Lessons from shipping an MCP server',
    date: '2026-05-02',
    excerpt: 'Notes from building a Model Context Protocol server from scratch — what mattered, what did not.',
    tags: ['AI', 'TypeScript', 'Infra'],
    content: `Building a Model Context Protocol (MCP) server taught me more about *interfaces* than about models.

The hard part was never the data. It was making one server feel native inside very different clients — each with its own quirks about how tools are described and called.

## Three things that paid off

1. **Treat the tool schema as the product.** Clear names and tight descriptions did more for usability than any clever feature.
2. **Fail loud, degrade soft.** Surface real errors in logs, but always return *something* usable to the client.
3. **Test against the real clients early.** Assumptions about behaviour rarely survived contact with an actual integration.

\`\`\`ts
// the smallest useful tool is still a tool
server.tool('get_status', 'Fetch current system status', async () => {
  return { ok: true, ts: Date.now() };
});
\`\`\`

If you're starting one: read other people's servers first. I learned the most by studying existing designs before writing a line.`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function sortedPosts(): BlogPost[] {
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
