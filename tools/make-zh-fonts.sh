#!/usr/bin/env bash
# Rebuild the two fonts the Chinese dark face uses.
#
# The PuHuiTi subset is the trap in this repo: it carries only the characters
# app.js, config.js and index.html can print, so a new Chinese label — a weather
# word, a different date format — renders in the iPad's system face and the line
# no longer matches the digits. Run this after editing Chinese copy.
#
# Needs: python3 with fontTools + brotli (pyftsubset on PATH), curl.
set -euo pipefail
cd "$(dirname "$0")/.."
WORK="${TMPDIR:-/tmp}/flipclock-fonts"
UBUNTU_DIR="${UBUNTU_DIR:-../robodiag-official-site/fonts}"
mkdir -p "$WORK" fonts

# 1. Every character this clock can draw, taken from the source rather than a
#    hand-kept list, which is what goes stale.
python3 - "$WORK/chars.txt" <<'PY'
import io, re, sys
text = ""
for name in ("app.js", "config.js", "index.html"):
    text += io.open(name, encoding="utf-8").read()
chars = sorted(set(re.findall(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]", text)))
io.open(sys.argv[1], "w", encoding="utf-8").write("".join(chars))
print("  characters to embed: %d" % len(chars))
PY

# 2. Alibaba PuHuiTi 3, Regular (55). The CDN sits behind a Referer ACL; any
#    alibabadesign referer is accepted. ~8.5 MB, then cut to a few kilobytes.
SRC="$WORK/PuHuiTi-55.ttf"
if [ ! -s "$SRC" ]; then
  curl -fL --max-time 900 \
    -H "Referer: https://fonts.alibabadesign.com/" \
    -H "Origin: https://fonts.alibabadesign.com/" -A "Mozilla/5.0" -o "$SRC" \
    "https://fonts.alibabadesign.com/AlibabaPuHuiTi-3/AlibabaPuHuiTi-3-55-Regular/AlibabaPuHuiTi-3-55-Regular.ttf"
fi

subset() { # src out chars|range
  if [ "$3" = "text" ]; then
    pyftsubset "$1" --text-file="$WORK/chars.txt" --flavor="$4" --no-hinting \
      --desubroutinize --layout-features=kern --output-file="$2"
  else
    pyftsubset "$1" --unicodes="U+0020-007E,U+00B0,U+00B7,U+2026" --flavor="$4" \
      --no-hinting --desubroutinize --output-file="$2"
  fi
  printf '  %-26s %s bytes\n' "$(basename "$2")" "$(wc -c < "$2")"
}

subset "$SRC" fonts/puhuiti-400.woff2 text woff2
subset "$SRC" fonts/puhuiti-400.woff  text woff

# 3. Ubuntu is the site's Latin face. Its WOFF2 subsets are what robodiag.cn
#    serves, so they are the source here — the same file the site ships, cut
#    again to the ASCII the clock needs plus the degree sign and middot.
for w in 400 700; do
  src="$UBUNTU_DIR/ubuntu-latin-$w-normal.woff2"
  if [ ! -s "$src" ]; then
    echo "  skip Ubuntu $w: no $src (set UBUNTU_DIR)" >&2
    continue
  fi
  subset "$src" "fonts/ubuntu-$w.woff2" range woff2
  subset "$src" "fonts/ubuntu-$w.woff"  range woff
done

# 4. Fail loudly if a character in the copy has no glyph in the subset.
python3 - "$WORK/chars.txt" <<'PY'
import io, sys
from fontTools.ttLib import TTFont
chars = io.open(sys.argv[1], encoding="utf-8").read()
cmap = TTFont("fonts/puhuiti-400.woff2").getBestCmap()
missing = [c for c in chars if ord(c) not in cmap]
if missing:
    sys.exit("  missing from PuHuiTi: %s" % "".join(missing))
print("  all %d characters present" % len(chars))
PY
