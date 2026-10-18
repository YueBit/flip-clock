# Flip clock

A flip clock for an iPad that has nothing better to do.

Black cards, cream digits, the date, the weather, one line of your own — sized to
fill the glass and left running for months. It ticks once a second, fades itself
from eleven at night, and picks the time back up the moment the screen wakes.

One static page. No build step, no framework, no dependencies, no API key.

Live: <https://yuebit.github.io/flip-clock/>

## What is in the box

| File | What it is |
| --- | --- |
| `index.html` | the markup, and not much of it |
| `styles.css` | every card, seam and shadow you see |
| `app.js` | time, the flip, weather, sound, night dimming |
| `config.js` | the only file you need to open |
| `data/followers.json` | Bilibili follower count, refreshed by a GitHub Action |
| `.github/workflows/followers.yml` | the half-hourly job that refreshes it |
| `sounds/` | four tick-and-tock pairs, 6–7 KB each |
| `soundlab.html` | tap-to-compare page for choosing a sound |
| `fonts/` | Rajdhani and Monocraft, cut down to ASCII and shipped as WOFF |
| `keep-awake.mp4` | a two-pixel silent loop that asks iOS not to sleep |
| `icon.svg`, `apple-touch-icon.png` | tab icon, home-screen icon |
| `tools/make-sounds.py` | rebuilds the sound sets from their parameters |

## Run it

Open `index.html` in a browser, or serve the folder properly:

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080/>. Weather needs the network; everything else
works with the cable pulled out.

## Make it yours

Open `config.js`. These are the lines worth knowing.

| Key | What it does |
| --- | --- |
| `city: 'Hangzhou'` | **Change this first.** Weather comes from Open-Meteo by place name, no key needed. If two places share the name, set `lat` and `lon` instead. |
| `weatherEvery: 15` | Minutes between weather refreshes. |
| `lang: 'en'` | `'en'` for English only, `'zh'` for Chinese, `'auto'` to copy the iPad. |
| `theme: 'dark'` | The theme the clock starts in: `'dark'` is charcoal and cream, `'light'` is paper and ink, `'pixel'` is stone blocks on a night sky, `'clay'` is terracotta on cream paper. |
| `swipeThemes: true` | Swipe left or right anywhere on the glass to change the theme. `false` pins the clock to `theme` and ignores swipes. |
| `hour12: false` | `true` switches to a 12-hour face with a small AM/PM. |
| `showSeconds: true` | The small seconds pair beside the minutes. Turn it off for a calmer board. |
| `notes: []` | The line under the date. Empty means the line does not exist — a slot you have not filled stays empty. Fill it with strings and it rotates through them every `noteEvery` minutes. |
| `showFollowers: true` | The Bilibili follower count in the line under the date. `followersEvery` sets how often the page re-reads it (15 minutes). |
| `tickSound: true` | One tick per second, at `tickVolume` (0.45 by default; 0 is silence). `tickSoundSet` chooses the voice. |
| `nightStart` / `nightEnd` / `nightDim` | From 23:00 to 07:00 the glass drops to 55% brightness. `nightDim: 0` turns that off. |
| `animate: false` | Replaces the flip with a plain cut. Only needed if a very old iPad stutters. |
| `drift: false` | Nudges the layout a few pixels every four minutes, so the panel never holds one image for weeks. Off by default: the redraw it forces can flash the cards on old hardware, and an LCD is not what burns in. |

## Themes

Four of them, and a swipe moves through them: **dark → light → pixel → clay → dark**.
Swipe left for the next, right for the previous; the name flashes at the top of
the glass for a second, and a tap still only arms the sound. The choice is kept
in `localStorage` on the device, so the clock comes back wearing the theme you
left it in.

To try one without editing a file — or to point a home-screen shortcut at it:

```
https://yuebit.github.io/flip-clock/?theme=pixel
```

`dark` · `light` · `pixel` · `clay`

The two pixel themes are one construction in two palettes: flat faces instead of
gradients, a 4px hard bevel for the raised edge, square corners, an 8px grid of
hairlines behind it, and **Monocraft** — a SIL OFL pixel face, licence in
`fonts/OFL-monocraft.txt` — for the digits, the date and the weather line.
Everything lands on a 9px grid: card heights are even, digit sizes are multiples
of 9, and the weather and follower marks are 9×9 bitmaps, so the edges stay hard
instead of greying out. `pixel` is stone on a night sky with a grass-green colon;
`clay` is terracotta on cream paper, in the warm printed colours of the Claude
palette.

`swipeThemes: false` pins the clock to the `theme` it was built with.

## Bilibili followers

The line under the date can carry the follower count of a Bilibili account:
`24° Overcast · 334 followers`. Set `showFollowers: false` to drop it.

It cannot read Bilibili directly. Their API answers **403** to any request
carrying an `Origin` header, which is every request a browser makes, and there is
no JSONP endpoint — so from a static page the count is unreachable, no matter how
the request is written.

Instead `.github/workflows/followers.yml` runs every half hour, reads
`api.bilibili.com/x/relation/stat` from the runner (server-side, where no CORS
rule applies), and commits `data/followers.json` — but only when the number has
actually moved, so a quiet channel leaves no trail of empty commits. The page
then reads that file from its own origin.

To point it at a different account, change `MID` in `tools/followers.py` (it is
also the `mid` in the JSON) and delete `data/followers.json` so the next run
rewrites it. Run the job by hand any time from **Actions → Bilibili followers →
Run workflow**; if the file never updates, check **Settings → Actions → General
→ Workflow permissions** is set to *Read and write*.

## Sound

Four voices ship in `sounds/`, each a pair — tick on even seconds, tock on odd, a
fifth lower. They are models of the mechanism, not recordings: a burst of
band-limited noise as the flap hits, a short ring from the plastic, wood or metal
it struck, a little body from the case, and silence after 65–75 ms, because that
is how long a flip clack really lasts.

To pick one, open `soundlab.html` on the iPad and tap the rows. Wood is the
default. You can try another on the clock itself without editing a file:

```
https://yuebit.github.io/flip-clock/?sound=sharp
```

`flap` · `wood` · `sharp` · `soft`

## Put it on the iPad

1. Open the site in **Safari**. Chrome on iOS cannot go full screen.
2. **Share → Add to Home Screen**, then launch from that icon. Safari's toolbars
   are gone and the clock has the whole glass.
3. **Tap the screen once.** iOS will not let a page make a sound until it has been
   touched. One tap arms the tick and the silent video for as long as the page
   stays open; a dim line at the bottom says so until you do.
4. **Settings → Display & Brightness → Auto-Lock → Never.** This, not the page,
   is what keeps the screen lit — Safari is not allowed to override it. The
   silent `keep-awake.mp4` helps on many iOS versions, but only this setting
   always works.
5. Leave it on the charger.
6. Optional: **Settings → Accessibility → Guided Access** pins the iPad to this
   one app, so a passing thumb cannot swipe out of it.

Landscape and portrait both fill the glass. In portrait the seconds move under
the minutes, which buys about a quarter more clock on a 1024×768 screen, and the
date block centres itself rather than stretching away from the time. Type scales
with the cards, so it stays in proportion at any size — and the layout re-measures
itself once the shipped font has loaded, so nothing sits a few pixels off until
the next resize. The clock re-syncs the second the iPad wakes or Safari comes
back to the foreground.

## Put it on GitHub Pages

```bash
git init
git add .
git commit -m "Flip clock for an always-on iPad"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
A minute later it is at `https://<you>.github.io/<repo>/`.

## Why the code looks like 2012

Because the iPad it was built for is from 2012.

The JavaScript is ES5 — `var`, no arrow functions, no template strings — and
every 3D transform carries its `-webkit-` twin, so a machine stuck on iOS 9 runs
it without a stutter. On anything newer all of that is simply ignored.

The type is Rajdhani, cut down to ASCII and shipped as **WOFF**: iOS 9 cannot
read WOFF2, and a self-hosted face means the iPad draws exactly what the desktop
preview showed instead of falling back to whatever serif the system happens to
own. Delete the `@font-face` block and the stack drops to Menlo. Monocraft, the
pixel face, ships the same way: a 10 KB WOFF subset, only downloaded when a
pixel theme is actually on screen.

The weather is the only thing that touches the network. When it fails, the line
hides itself and the clock carries on without it.

## When something is off

| Symptom | What to do |
| --- | --- |
| No weather line | Check `city`. An unknown name returns nothing, and iOS builds too old for TLS 1.2 cannot reach the service at all. The clock itself keeps running. |
| The time is wrong | It follows the iPad's clock and time zone. |
| The screen sleeps | Step 4 above. Confirm Auto-Lock really says `Never`. |
| The flip stutters | `animate: false` in `config.js`. |
| The theme is not the one set in `config.js` | A swipe is remembered on that device and wins over the config. `?theme=dark`, `?theme=light`, `?theme=pixel` or `?theme=clay` pins it for that load. |
| Swiping does nothing | The drag has to be mostly horizontal and at least 55px. Check `swipeThemes` is not `false`. |
| No tick sound | Tap the page once, and check the side switch is not set to mute. |
