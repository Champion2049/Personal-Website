/**
 * Load a Google Fonts stylesheet on demand (once). Used so pages with their
 * own type system — Night City — don't make the portfolio download its fonts.
 */
export function loadFonts(id: string, href: string) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const NIGHT_CITY_FONTS =
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=Orbitron:wght@700;900&display=swap';
