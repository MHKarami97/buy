/**
 * Inline stroke icons (24x24 grid, drawn with currentColor).
 * Kept as plain data so they are tree-shakeable, cacheable and testable.
 */
export var ICON_PATHS = Object.freeze({
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  lists: '<circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/><path d="M9 6h11M9 12h11M9 18h7"/>',
  cart: '<path d="M3 4h2.5l2 11h10.5l2-8H7"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  book: '<path d="M4 19V5.5A2.5 2.5 0 0 1 6.5 3H20v14H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  gift: '<rect x="3" y="9" width="18" height="4" rx="1"/><rect x="5" y="13" width="14" height="8" rx="1"/><path d="M12 9v12"/><path d="M12 9c-2-4-6-3-5 0 .5 1.5 3 1 5 0Zm0 0c2-4 6-3 5 0-.5 1.5-3 1-5 0Z"/>',
  chart: '<rect x="4" y="11" width="3.5" height="9" rx="1"/><rect x="10.25" y="4" width="3.5" height="16" rx="1"/><rect x="16.5" y="14" width="3.5" height="6" rx="1"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1"/>',
  scale: '<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7 2.5 14a3 3 0 0 0 5 0L5 7Z"/><path d="M19 7l-2.5 7a3 3 0 0 0 5 0L19 7Z"/>',
  alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4"/><path d="M12 17.2v.1"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  more: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5 4 4 0 0 1 17.5 18H7Z"/>',
  download: '<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14"/>',
  upload: '<path d="M12 16V5M7.5 9 12 4.5 16.5 9M5 20h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  chevron: '<path d="M14.5 6 8.5 12l6 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeOff: '<path d="M10.6 5.6c.5-.1 1-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 7.6C3.9 9.4 2.5 12 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.4 3.8-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M4 4l16 16"/>',
  trend: '<path d="M3.5 17 9 11.5l4 4L20.5 8"/><path d="M15 8h5.5v5.5"/>'
})
