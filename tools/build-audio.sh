#!/usr/bin/env bash
# Generates pronunciation clips for every word in the bank.
# Each clip: macOS `say` (en_US voice) → mono 44.1 kHz AAC/M4A-free WAV →
# gentle fade-out at the end and a short silent tail, so playback never
# ends on a live waveform (the source of the click).
#
# Requires: say (macOS), ffmpeg.
# Usage: tools/build-audio.sh

set -euo pipefail

VOICE="Eddy (English (United States))"
RATE=180            # words per minute for `say`; ~0.86x of default feel
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/audio"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$OUT_DIR"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORDS=$(grep -oE "word: '[^']+'" "$ROOT/app.js" | sed -E "s/word: '([^']+)'/\1/")

count=0
for word in $WORDS; do
  aiff="$TMP_DIR/$word.aiff"
  wav="$OUT_DIR/$word.wav"

  say -v "$VOICE" -r "$RATE" -o "$aiff" "$word"

  # reverse → fade IN (which becomes a fade-out on the real timeline)
  # → reverse back → append a short silent tail
  ffmpeg -y -loglevel error -i "$aiff" \
    -af "areverse,afade=t=in:st=0:d=0.10,areverse,apad=pad_dur=0.16" \
    -ar 44100 -ac 1 -c:a pcm_s16le "$wav"

  count=$((count + 1))
done

echo "built $count clips in $OUT_DIR"
