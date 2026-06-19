// True on macOS / iOS where the Command (⌘) key is used.
export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

// Display label for the command-palette shortcut, OS-aware.
export const modKeyLabel = isMac ? '⌘' : 'Ctrl';
