#!/usr/bin/env bash
# Rebuild the fonts the Chinese dark face uses.
#
# 喜脉体 is the face robodiag.cn sets its titles in, and it carries its own
# Latin, so it draws the clock's digits too. The subset here contains only the
# characters app.js, config.js and index.html can print plus ASCII — that is the
# trap in this repo: add a Chinese label and the new character falls through to
# the iPad's system face, and the line stops matching the digits. Run this after
# editing Chinese copy; it fails loudly if a character has no glyph.
#
# Needs: python3 with fontTools + brotli (pyftsubset on PATH), curl, unzip.
set -euo pipefail
cd "$(dirname "$0")/.."
WORK="${TMPDIR:-/tmp}/flipclock-fonts"
UBUNTU_DIR="${UBUNTU_DIR:-../robodiag-official-site/fonts}"
mkdir -p "$WORK" fonts

# 1. Every character this clock can draw, taken from the source rather than a
#    hand-kept list, which is what goes stale. ASCII is in because 喜脉体 draws
#    the digits and the degree sign itself.
python3 - "$WORK/chars.txt" <<'PY'
import io, re, sys
text = ""
for name in ("app.js", "config.js", "index.html"):
    text += io.open(name, encoding="utf-8").read()
cjk = re.findall(r"[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]", text)
extra = "".join(chr(c) for c in range(0x20, 0x7F)) + "\u00b0\u00b7\u2026\u2014"
chars = sorted(set(cjk) | set(extra))
io.open(sys.argv[1], "w", encoding="utf-8").write("".join(chars))
print("  characters to embed: %d" % len(chars))
PY

# 2. 字制区喜脉体 2.00. 猫啃网 hosts the author's package with their permission;
#    the author's own channel is a WeChat account and their site has closed.
XM_ZIP="$WORK/maoken-ximaiti.zip"
XM_SRC="$WORK/ximai/字制区喜脉体.ttf"
if [ ! -s "$XM_ZIP" ]; then
  curl -fL --max-time 900 -A "Mozilla/5.0" -e "https://www.maoken.com/freefonts/8918.html" \
    -o "$XM_ZIP" \
    "https://oss.maoken.com/%E7%8C%AB%E5%95%83%E5%AD%97%E4%BD%93/%E4%B8%AD%E5%9B%BD%E5%A4%A7%E9%99%86/%E5%AD%97%E5%88%B6%E5%8C%BA%E5%96%9C%E8%84%89%E4%BD%932.000_%E7%8C%AB%E5%95%83%E7%BD%91.zip"
fi
if [ ! -s "$XM_SRC" ]; then
  rm -rf "$WORK/ximai"; mkdir -p "$WORK/ximai"
  unzip -o -q "$XM_ZIP" -d "$WORK/ximai"
  XM_SRC="$(find "$WORK/ximai" -name '字制区喜脉体.ttf' | head -1)"
fi
[ -s "$XM_SRC" ] || { echo "喜脉体.ttf not found in $XM_ZIP" >&2; exit 1; }

subset() { # src out charset(range|text) flavor
  if [ "$3" = "text" ]; then
    pyftsubset "$1" --text-file="$WORK/chars.txt" --flavor="$4" --no-hinting \
      --desubroutinize --output-file="$2"
  else
    pyftsubset "$1" --unicodes="U+0020-007E,U+00B0,U+00B7,U+2026" --flavor="$4" \
      --no-hinting --desubroutinize --output-file="$2"
  fi
  printf '  %-26s %s bytes\n' "$(basename "$2")" "$(wc -c < "$2")"
}

subset "$XM_SRC" fonts/ximaiti-400.woff2 text woff2
subset "$XM_SRC" fonts/ximaiti-400.woff  text woff

# 3. Ubuntu is the site's Latin face and stays behind 喜脉体 in the stack; its
#    WOFF2 subsets are what robodiag.cn serves, so they are the source here.
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
cmap = TTFont("fonts/ximaiti-400.woff2").getBestCmap()
missing = [c for c in chars if ord(c) not in cmap]
if missing:
    sys.exit("  missing from 喜脉体: %s" % "".join(missing))
print("  all %d characters present" % len(chars))
PY
