/**
 * Tiny dependency-free Markdown -> HTML renderer for blog posts.
 * Supports: headings, bold/italic, inline code, code fences, links,
 * blockquotes, unordered/ordered lists, horizontal rules and paragraphs.
 * Blog content is authored by the site owner (trusted), but we still escape
 * raw HTML so stray angle brackets render literally.
 */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  let s = escapeHtml(text);
  const codes: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_m, c) => { codes.push(c); return `%%C${codes.length - 1}%%`; });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/%%C(\d+)%%/g, (_m, i) => `<code>${codes[+i]}</code>`);
  return s;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const isBlank = (l: string) => /^\s*$/.test(l);
  const isBlock = (l: string) =>
    /^(#{1,6})\s+/.test(l) || /^```/.test(l) || /^>\s?/.test(l) ||
    /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || /^\s*(---+|\*\*\*+)\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { out.push('<hr/>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      out.push('<ul>' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push('<ol>' + buf.map((b) => `<li>${inline(b)}</li>`).join('') + '</ol>');
      continue;
    }
    if (isBlank(line)) { i++; continue; }

    const buf: string[] = [];
    while (i < lines.length && !isBlank(lines[i]) && !isBlock(lines[i])) { buf.push(lines[i]); i++; }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

export function readingTime(md: string): string {
  const words = md.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
