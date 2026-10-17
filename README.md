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
| `sounds/` | four tick-and-tock pairs, 6–7 KB each |
| `soundlab.html` | tap-to-compare page for choosing a sound |
| `fonts/` | Rajdhani, cut down to ASCII and shipped as WOFF |
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
| `theme: 'dark'` | `'dark'` is charcoal and cream; `'light'` is paper and ink. |
| `hour12: false` | `true` switches to a 12-hour face with a small AM/PM. |
| `showSeconds: true` | The small seconds pair beside the minutes. Turn it off for a calmer board. |
| `notes: []` | The line under the date. Empty means the line does not exist — a slot you have not filled stays empty. Fill it with strings and it rotates through them every `noteEvery` minutes. |
| `tickSound: true` | One tick per second, at `tickVolume` (0.45 by default; 0 is silence). `tickSoundSet` chooses the voice. |
| `nightStart` / `nightEnd` / `nightDim` | From 23:00 to 07:00 the glass drops to 55% brightness. `nightDim: 0` turns that off. |
| `animate: false` | Replaces the flip with a plain cut. Only needed if a very old iPad stutters. |
| `drift: false` | Nudges the layout a few pixels every four minutes, so the panel never holds one image for weeks. Off by default: the redraw it forces can flash the cards on old hardware, and an LCD is not what burns in. |

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
own. Delete the `@font-face` block and the stack drops to Menlo.

The weather is the only thing that touches the network. When it fails, the line
hides itself and the clock carries on without it.

## When something is off

| Symptom | What to do |
| --- | --- |
| No weather line | Check `city`. An unknown name returns nothing, and iOS builds too old for TLS 1.2 cannot reach the service at all. The clock itself keeps running. |
| The time is wrong | It follows the iPad's clock and time zone. |
| The screen sleeps | Step 4 above. Confirm Auto-Lock really says `Never`. |
| The flip stutters | `animate: false` in `config.js`. |
| No tick sound | Tap the page once, and check the side switch is not set to mute. |
