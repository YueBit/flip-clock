# Flip clock for an old iPad

A single static page: a large serif flip clock, the date, today's weather and a
line of your own, sized to fill an iPad screen and left running for weeks.

No build step, no framework, no dependencies, no API key. Three small text
files plus one 1.5 KB video.

```
index.html            markup
styles.css            all styling
config.js             ← the only file you edit (city, theme, notes…)
app.js                clock, flip animation, weather, night dim
keep-awake.mp4        2-pixel silent loop that asks iOS not to sleep
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
| `city: 'Hangzhou'` | **Change this to your city.** Weather is looked up by name (Open-Meteo, no key). If the name is ambiguous, set `lat`/`lon` instead. |
| `theme: 'dark'` | `'dark'` is warm charcoal and cream; `'light'` is paper and ink. |
| `hour12: false` | `true` gives a 12-hour clock with a small AM/PM. |
| `notes: []` | The line under the date. Give it any number of strings and it rotates through them; leave `[]` for the built-in Robodiag lines. |
| `nightStart` / `nightEnd` / `nightDim` | From 23:00 to 07:00 the screen fades to `nightDim` (0.55) brightness. Set `nightDim: 0` to turn it off. |
| `showSeconds` | Hide the small seconds pair for a calmer board. |
| `animate: false` | Turns the flip into a plain cut. Only needed if a very old iPad stutters. |
| `drift: true` | Nudges the layout a few pixels every four minutes so the panel never holds one image for weeks. |

## Put it on the iPad

1. Open the site in **Safari** (Chrome on iOS cannot go full screen).
2. **Share → Add to Home Screen.** Launching from that icon hides Safari's
   toolbars.
3. **Settings → Display & Brightness → Auto-Lock → Never.** This is the part
   that keeps the screen lit; a web page on its own is not allowed to override
   it. The silent `keep-awake.mp4` loops in the background and does stop the
   screen sleeping on many iOS versions, but the system setting is the only
   thing that always works.
4. Leave it on the charger.
5. Optional: **Settings → Accessibility → Guided Access** locks the iPad to
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

The only network request is the weather; if it fails, the weather line hides
itself and the clock carries on.

## If something is off

- **No weather line.** Check `city` — an unknown name returns nothing. Very old
  iOS builds that cannot do TLS 1.2 will also fail; the clock still works.
- **Clock is wrong.** It follows the iPad's own clock and time zone.
- **Screen sleeps.** See step 3 above; check that Auto-Lock is really `Never`.
- **The flip stutters.** Set `animate: false` in `config.js`.
- **Digits look like Times.** Didot and Baskerville are used when present;
  older iPads fall back to the system serif, which is still correct.
