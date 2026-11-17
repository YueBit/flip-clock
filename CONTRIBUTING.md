# Contributing

Thanks for taking a look at Flip clock.

## Local development

There is no build step and no dependency install. Open `index.html` directly, or
serve the folder:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080/>. Weather and the live quote need network access;
the clock itself works offline.

## Configuration

Personal settings live in `config.js`:

- `city` / `lat` / `lon`
- `lang` (`en`, `zh`, or `auto`)
- `hour12`, `showSeconds`, `animate`
- `nightStart`, `nightEnd`, `nightDim`
- `tickSound`, `musicBox`

Do not commit personal locations or API credentials.

## Pull requests

- Keep changes focused and explain the visible/behavioral effect.
- Preserve the no-build, no-framework, no-dependency design.
- Test at desktop and iPad-sized viewports, in both languages when relevant.
- Check dark/night dimming if touching colors or layout.
- Include a screenshot or short recording for visual changes.

## Fonts and assets

The display face is a reduced 字制区喜脉体 subset under `fonts/`. Do not add a full
font or a third-party CDN. If UI copy changes, rebuild the subsets with
`tools/make-zh-fonts.sh` and keep the license files in place.
