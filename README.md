# Flip clock for an old iPad

A single static page: a large serif flip clock, the date, today's weather and a
line of your own, sized to fill an iPad screen and left running for weeks.

No build step, no framework, no dependencies, no API key. Three small text
files plus one 1.5 KB video.

```
index.html            markup
styles.css            all styling
config.js             ← the only file you edit (city, language, theme, notes…)
app.js                clock, flip animation, weather, tick sound, night dim
keep-awake.mp4        2-pixel silent loop that asks iOS not to sleep
tick.wav / tock.wav   the second-hand click (33 ms each, 3.5 KB)
fonts/                Rajdhani (SIL OFL) subset to ASCII, as WOFF for old iOS
icon.svg              tab / bookmark icon
apple-touch-icon.png  home-screen icon
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/` — the weather needs a network connection,
everything else works offline.

## Configure it

Everything lives in `config.js`. The lines you are most likely to touch:

| Key | What it does |
| --- | --- |
| `lang: 'en'` | `'en'` English only (default), `'zh'` Chinese, `'auto'` follows the iPad. |
| `city: 'Hangzhou'` | **Change this to your city.** Weather is looked up by name (Open-Meteo, no key). If the name is ambiguous, set `lat`/`lon` instead. |
| `theme: 'dark'` | `'dark'` is warm charcoal and cream; `'light'` is paper and ink. |
| `hour12: false` | `true` gives a 12-hour clock with a small AM/PM. |
| `notes: []` | The line under the date. `[]` shows nothing at all; give it strings and it rotates through them every `noteEvery` minutes. |
| `tickSound: true` | Tick and tock on every second, 0.45 by default (`tickVolume`, 0 mutes it). iOS needs one tap on the page before audio may start, and the hardware mute switch silences it. |
| `nightStart` / `nightEnd` / `nightDim` | From 23:00 to 07:00 the screen fades to `nightDim` (0.55) brightness. Set `nightDim: 0` to turn it off. |
| `showSeconds` | Hide the small seconds pair for a calmer board. |
| `animate: false` | Turns the flip into a plain cut. Only needed if a very old iPad stutters. |
| `drift: false` | Nudges the layout a few pixels every four minutes so the panel never holds one image for weeks. Off by default: on an old iPad the full-screen re-rasterise it forces can flash the cards. |

## Put it on the iPad

1. Open the site in **Safari** (Chrome on iOS cannot go full screen).
2. **Share → Add to Home Screen.** Launching from that icon hides Safari's
   toolbars.
3. **Tap the screen once.** iOS only allows sound (and the silent video) after a
   touch; a single tap arms both for as long as the page stays open. Until you
   do, a dim line at the bottom says "Tap the screen for sound" — it disappears
   for good on the first tap.
4. **Settings → Display & Brightness → Auto-Lock → Never.** This is the part
   that keeps the screen lit; a web page on its own is not allowed to override
   it. The silent `keep-awake.mp4` loops in the background and does stop the
   screen sleeping on many iOS versions, but the system setting is the only
   thing that always works.
5. Leave it on the charger.
6. Optional: **Settings → Accessibility → Guided Access** locks the iPad to
   this one app so nobody swipes out of it.

The page is fully responsive: landscape and portrait both fill the screen, and
it re-syncs the moment the iPad wakes or Safari returns to the foreground.

## Put it on GitHub Pages

```bash
git init
git add .
git commit -m "Flip clock for an always-on iPad"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then in the repository: **Settings → Pages → Source: Deploy from a branch →
`main` / `/ (root)`**. The site appears at `https://<you>.github.io/<repo>/`
about a minute later.

## Why it looks like 2012 inside

The JavaScript is ES5 on purpose (no arrow functions, no `let`, no template
strings) and the CSS carries `-webkit-` prefixes on every 3D transform, so an
iPad stuck on iOS 9 still runs it. If your iPad is newer all of that is simply
ignored.

The type is Rajdhani, subset to ASCII and shipped as **WOFF**: iOS 9 cannot read
WOFF2, and a self-hosted face means the iPad renders exactly what the desktop
preview shows instead of falling back to whatever serif the system has. Switch
it off by deleting the `@font-face` block — the stack then falls to Menlo.

The weather is the only network request (plus those local files); if it fails,
the weather line hides itself and the clock carries on.

## If something is off

- **No weather line.** Check `city` — an unknown name returns nothing. Very old
  iOS builds that cannot do TLS 1.2 will also fail; the clock still works.
- **Clock is wrong.** It follows the iPad's own clock and time zone.
- **Screen sleeps.** See step 3 above; check that Auto-Lock is really `Never`.
- **The flip stutters.** Set `animate: false` in `config.js`.
- **No tick sound.** Tap the page once after opening it (iOS needs a gesture
  before audio), and check the side mute switch is off.
