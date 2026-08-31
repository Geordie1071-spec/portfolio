#!/usr/bin/env bash
# Downloads placeholder frame images (Unsplash) and preview clips (Mixkit).
# Run from repo root: bash scripts/fetch-frames.sh
set -euo pipefail
ROOT="/workspace/public/uploads"
PREV="$ROOT/previews"
FR="$ROOT/frames"
mkdir -p "$PREV" "$FR"

fetch_frame() {
  local id="$1" out="$2"
  curl -fsSL "https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&h=875&q=80" -o "${FR}/${out}.jpg"
  ffmpeg -y -loglevel error -i "${FR}/${out}.jpg" -vf "scale=1400:875:force_original_aspect_ratio=increase,crop=1400:875" -q:v 4 "${FR}/${out}.webp"
  rm -f "${FR}/${out}.jpg"
}

fetch_preview() {
  local url="$1" name="$2"
  curl -fsSL "$url" -o "${PREV}/${name}-dl.mp4"
  ffmpeg -y -loglevel error -i "${PREV}/${name}-dl.mp4" -t 6 \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
    -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 28 "${PREV}/${name}.mp4"
  rm -f "${PREV}/${name}-dl.mp4"
}

# Mixkit preview clips (free license)
fetch_preview "https://assets.mixkit.co/videos/4915/4915-720.mp4" blirk
fetch_preview "https://assets.mixkit.co/videos/4354/4354-720.mp4" champ
fetch_preview "https://assets.mixkit.co/videos/4779/4779-720.mp4" odds
fetch_preview "https://assets.mixkit.co/videos/4982/4982-720.mp4" clinic

# Unsplash frame stills (free license)
fetch_frame "photo-1555949963-aa79dcee981c" blirk-p1
fetch_frame "photo-1460925895917-afdab827c52f" blirk-p2
fetch_frame "photo-1504639725590-34d0984388bd" blirk-p3
fetch_frame "photo-1551288049-bebda4e38f71" blirk-p4
fetch_frame "photo-1516321318423-f06f85e504b3" blirk-p5
fetch_frame "photo-1553877522-43269d4ea984" blirk-p6
fetch_frame "photo-1522071820081-009f0129c71c" blirk-p7
fetch_frame "photo-1511512578047-dfb367046420" champ-p1
fetch_frame "photo-1611162616475-46b635cb6868" champ-p2
fetch_frame "photo-1488590528505-98d2b5aba04b" champ-p3
fetch_frame "photo-1551650975-87deedd944c3" champ-p4
fetch_frame "photo-1498050108023-c5249f4df085" champ-p5
fetch_frame "photo-1574717024653-61fd2cf4d44d" champ-p6
fetch_frame "photo-1543286386-713bdd548da4" odds-p1
fetch_frame "photo-1551288049-bebda4e38f71" odds-p2
fetch_frame "photo-1460925895917-afdab827c52f" odds-p3
fetch_frame "photo-1563986768609-322da13575f3" odds-p4
fetch_frame "photo-1563013544-824ae1b704d3" odds-p5
fetch_frame "photo-1556761175-b413da4baf72" odds-p6
fetch_frame "photo-1576091160399-112ba8d25d1d" clinic-p1
fetch_frame "photo-1579684385127-1ef15d508118" clinic-p2
fetch_frame "photo-1579684385127-1ef15d508118" clinic-p3
fetch_frame "photo-1559757148-5c350d0d3c56" clinic-p4
fetch_frame "photo-1576091160550-2173dba999ef" clinic-p5
fetch_frame "photo-1519494026892-80bbd2d6fd0d" clinic-p6
fetch_frame "photo-1576091160399-112ba8d25d1d" clinic-p7

echo "Assets ready: $(ls -1 "$FR"/*.webp | wc -l) frames, $(ls -1 "$PREV"/*.mp4 | wc -l) previews."
