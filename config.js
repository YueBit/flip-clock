// Robodiag flip clock — the only file you need to edit.
// Everything here is optional; delete a line to fall back to the default.

var CLOCK_CONFIG = {

  // "auto" follows the iPad's language (zh -> Chinese, anything else -> English)
  lang: 'auto',

  // false = 24-hour clock (09:41), true = 12-hour with a small AM/PM
  hour12: false,

  // 'dark' (warm charcoal, easy on the eyes at night) or 'light' (paper)
  theme: 'dark',

  // Show the small seconds pair next to the minutes
  showSeconds: true,

  // Flip animation. Set false if a very old iPad stutters.
  animate: true,

  // ---- weather (Open-Meteo, no account or key needed) ----
  // Change the city to yours. If the name is not found, use lat/lon instead.
  city: 'Shanghai',
  lat: null,          // e.g. 31.2304 — overrides city when both are set
  lon: null,          // e.g. 121.4737
  units: 'celsius',   // 'celsius' | 'fahrenheit'
  weatherEvery: 15,   // minutes between refreshes

  // ---- the line under the date, rotating every noteEvery minutes ----
  // Leave as [] to use a built-in pair of Robodiag lines in the current language.
  notes: [],
  noteEvery: 30,

  // ---- night dimming (screen only; it cannot touch the iPad's brightness) ----
  nightStart: 23,
  nightEnd: 7,
  nightDim: 0.55,     // 0 disables it

  // Nudge the layout a few pixels every few minutes so the panel does not
  // hold one image for weeks. Harmless; set false if you prefer it locked.
  drift: true,

  // Plays a silent 2-pixel video to keep Safari from sleeping the screen.
  // Some iOS versions ignore it — see README for the setting that always works.
  keepAwake: true
};
