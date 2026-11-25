#!/usr/bin/env bash
# Generates pronunciation clips for every word in the bank.
#
# Voice handling used to be a trap: `say -v "Eddy (English (United States))"`
# silently falls back to the SYSTEM DEFAULT voice when the name doesn't match,
# and on this machine that default is Russian — which is exactly the "wrong
# accent" that shipped once. So instead of hard-coding a name we look the voice
# up by locale in `say -v '?'`, then verify the result isn't the default voice.
#
# Each clip: say → mono 44.1 kHz WAV with a fade-out at the end and a short
# silent tail, so playback never ends on a live waveform.
#
# Requires: say (macOS), ffmpeg.
# Usage: tools/build-audio.sh

set -euo pipefail

PREFERRED=("Samantha" "Ava" "Allison" "Alex")   # classic US voices, best first
LOCALE="en_US"
RATE=180
SPAN="ть"   # any of these letters in the voice name means it isn't English

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/audio"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
mkdir -p "$OUT_DIR"

# ── resolve a working en_US voice ──────────────────────────────────────────
voice_list() {
  say -v '?' | awk '/en_US/ {sub(/ +#.*/,""); sub(/ +$/,"")} /en_US/ {print}' \
    | sed -E 's/[[:space:]]+en_US$//' | sort -u
}

pick_voice() {
  local name
  for want in "${PREFERRED[@]}"; do
    name=$(voice_list | grep -iF "$want" | head -1 || true)
    if [ -n "$name" ]; then
      say -v "$name" -o "$TMP_DIR/probe.aiff" "test" 2>/dev/null && echo "$name" && return 0
    fi
  done
  name=$(voice_list | head -1)
  [ -n "$name" ] && echo "$name" && return 0
  return 1
}

VOICE="$(pick_voice)" || { echo "No en_US voice installed. Add one in System Settings → Accessibility → Spoken Content." >&2; exit 1; }

# ── prove the voice is actually used, not silently swapped ────────────────
say -o "$TMP_DIR/default.aiff" "always" 2>/dev/null
say -v "$VOICE" -r "$RATE" -o "$TMP_DIR/chosen.aiff" "always"
if cmp -s "$TMP_DIR/default.aiff" "$TMP_DIR/chosen.aiff"; then
  echo "Voice '$VOICE' was ignored and the system default was used instead." >&2
  echo "Install a US English voice or set it as default, then re-run." >&2
  exit 1
fi
if printf '%s' "$VOICE" | grep -q "[$SPAN]"; then
  echo "Resolved voice '$VOICE' looks non-English; refusing to generate." >&2
  exit 1
fi

echo "voice: $VOICE"

# ── build ─────────────────────────────────────────────────────────────────
ROOT_JS="$ROOT/app.js"
WORDS=$(grep -oE "word: '[^']+'" "$ROOT_JS" | sed -E "s/word: '([^']+)'/\1/")

count=0
for word in $WORDS; do
  aiff="$TMP_DIR/$word.aiff"
  wav="$OUT_DIR/$word.wav"

  say -v "$VOICE" -r "$RATE" -o "$aiff" "$word"

  # reverse → fade IN (a fade-out on the real timeline) → reverse → silent tail
  ffmpeg -y -loglevel error -i "$aiff" \
    -af "areverse,afade=t=in:st=0:d=0.10,areverse,apad=pad_dur=0.16" \
    -ar 44100 -ac 1 -c:a pcm_s16le "$wav"

  count=$((count + 1))
done

echo "built $count clips in $OUT_DIR"
