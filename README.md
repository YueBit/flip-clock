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
| `fonts/` | 字制区喜脉体 — the display face both languages are set in — with Ubuntu behind it, each cut down to the characters the clock prints |
| `keep-awake.mp4` | a two-pixel silent loop that asks iOS not to sleep |
| `icon.svg`, `apple-touch-icon.png` | tab icon, home-screen icon |
| `tools/make-sounds.py` | rebuilds the sound sets from their parameters |
| `tools/make-zh-fonts.sh` | re-subsets the Chinese fonts after editing Chinese copy |

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
| `lang: 'en'` | `'en'` for English only, `'zh'` for Chinese, `'auto'` to copy the iPad. `?lang=zh` on the URL overrides it for one load. |
| `hour12: false` | `true` switches to a 12-hour face with a small AM/PM. |
| `showSeconds: true` | The small seconds pair beside the minutes. Turn it off for a calmer board. |
| `notes: []` | The line under the date. Empty means the line does not exist — a slot you have not filled stays empty. Fill it with strings and it rotates through them every `noteEvery` minutes. |
| `showFollowers: true` | The Bilibili follower count in the line under the date. `followersEvery` sets how often the page re-reads it (15 minutes). |
| `showIndex: true` | The Shanghai Composite beside the followers, read live from Tencent's quote API. `indexEvery` is the gap while the market is shut (15 minutes); during the session it refreshes every minute. |
| `tickSound: true` | One tick per second, at `tickVolume` (0.45 by default; 0 is silence). `tickSoundSet` chooses the voice. |
| `nightStart` / `nightEnd` / `nightDim` | From 23:00 to 07:00 the glass drops to 55% brightness. `nightDim: 0` turns that off. |
| `animate: false` | Replaces the flip with a plain cut. Only needed if a very old iPad stutters. |
| `drift: false` | Nudges the layout a few pixels every four minutes, so the panel never holds one image for weeks. Off by default: the redraw it forces can flash the cards on old hardware, and an LCD is not what burns in. |

## One face

Charcoal cards, cream digits, one theme only — there is nothing to swipe between.
The type is **字制区喜脉体**, the display face robodiag.cn titles its pages and its
wordmark with, and it sets both languages: the digits, the date, the weather line,
the hint. 喜脉体 carries its own Latin alphabet, so English and Chinese are
the same hand rather than a display number over body text. Ubuntu stays behind it
in the stack, so anything outside the subset still lands on the site's other
face.

The file is a 149-glyph subset: the characters this clock can print, plus ASCII,
cut from the 3.5 MB family. `tools/make-zh-fonts.sh` rebuilds it and fails if a
character in the copy has no glyph. Licence: `fonts/LICENSE-ximaiti.txt`.

`layout()` sets the card's type at `0.90h`: 喜脉体's figures advance 0.60 em
against a Latin text face's 0.50 and its ink runs 0.77 em high, so at 0.90h the
digit fills a `0.58h` card with the advance still inside the plate and the ink
centred to within a pixel or two. The hint at the bottom keeps a larger floor,
because a display face at 15 px stops being readable.

Set `lang: 'zh'` for Chinese, or add `?lang=zh` to the URL — the same board,
linkable, which is also how a home-screen shortcut pins a language.

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

## Shanghai Composite (上证指数)

Sits beside the followers, same line:

```
24° Overcast · 334 followers · SSE 3716.28 +0.24%
```

Unlike the follower count, this one needs no Action and no file. Tencent's
`qt.gtimg.cn` quote endpoint answers with `Access-Control-Allow-Origin: *`, so the
page reads it itself (`app.js`, `loadIndex`) — a plain XHR, so the iOS 9 path
still works. The body is a JS assignment around a tilde record;
`[3]` is the index, `[4]` the point change, `[5]` the percentage.

The number is the last one the exchange printed. Outside 09:30–11:30 and
13:00–15:00, Monday to Friday, that is the previous close, which is what the
board on a wall should show. During the session it refreshes once a minute, the
rest of the time every `indexEvery` minutes.

The change is coloured the Shanghai way: **red for a rise, green for a fall**, at
the line's own weight so it cannot shout over the clock. A flat market keeps the
plain ink.

To track a different instrument, change the code in `loadIndex` and the label in
`paintIndex`: `s_sh000001` is the Shanghai Composite, `s_sz399001` Shenzhen,
`s_sh000300` the CSI 300. If the request fails — offline, or the endpoint moves —
the line quietly keeps the weather and the followers; nothing is made up.

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

The type is shipped as **WOFF** with a WOFF2 twin: iOS 9 cannot read WOFF2, and
a self-hosted face means the iPad draws exactly what the desktop preview showed
instead of falling back to whatever the system happens to own. Delete the
`@font-face` block and the stack drops to the system faces.

The weather is the only thing that touches the network. When it fails, the line
hides itself and the clock carries on without it.

## When something is off

| Symptom | What to do |
| --- | --- |
| No weather line | Check `city`. An unknown name returns nothing, and iOS builds too old for TLS 1.2 cannot reach the service at all. The clock itself keeps running. |
| The time is wrong | It follows the iPad's clock and time zone. |
| The screen sleeps | Step 4 above. Confirm Auto-Lock really says `Never`. |
| The flip stutters | `animate: false` in `config.js`. |
| Chinese text shows in a different face from the digits | A character was added to the copy after the font was cut. Run `tools/make-zh-fonts.sh`; it collects every Chinese character in the source and fails if one has no glyph. |
| No tick sound | Tap the page once, and check the side switch is not set to mute. |
