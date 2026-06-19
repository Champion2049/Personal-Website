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
