#!/usr/bin/env bash
# Downloads placeholder assets from realstoman/nextjs-tailwindcss-portfolio (MIT).
# https://github.com/realstoman/nextjs-tailwindcss-portfolio
set -euo pipefail
BASE="https://raw.githubusercontent.com/realstoman/nextjs-tailwindcss-portfolio/main/public/images"
FR="/workspace/public/uploads/frames"
PR="/workspace/public/uploads/previews"
mkdir -p "$FR" "$PR"

curl -fsSL "$BASE/ui-project-1.jpg" -o "$FR/shared-ui-1.jpg"
curl -fsSL "$BASE/ui-project-2.jpg" -o "$FR/shared-ui-2.jpg"
curl -fsSL "$BASE/web-project-1.jpg" -o "$FR/shared-web-1.jpg"
curl -fsSL "$BASE/web-project-2.jpg" -o "$FR/shared-web-2.jpg"
curl -fsSL "$BASE/mobile-project-1.jpg" -o "$FR/shared-mobile-1.jpg"
curl -fsSL "$BASE/mobile-project-2.jpg" -o "$FR/shared-mobile-2.jpg"

copy_frames() {
  local prefix=$1; shift
  local i=1
  for src in "$@"; do
    cp "$FR/$src.jpg" "$FR/${prefix}-p${i}.jpg"
    i=$((i + 1))
  done
}

copy_frames health shared-ui-1 shared-web-2 shared-mobile-2 shared-ui-2
copy_frames phoenix shared-mobile-2 shared-ui-1 shared-web-1 shared-mobile-1
copy_frames cloud shared-ui-2 shared-web-2 shared-mobile-2 shared-web-1
copy_frames wetalk shared-mobile-1 shared-ui-1 shared-web-2 shared-mobile-2

for pair in "health:shared-web-2" "phoenix:shared-mobile-2" "cloud:shared-ui-2" "wetalk:shared-mobile-1"; do
  name="${pair%%:*}"; img="${pair##*:}"
  ffmpeg -y -loglevel error -loop 1 -i "$FR/${img}.jpg" -t 6 \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720" \
    -c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 26 "$PR/${name}.mp4"
done

echo "Done: 4 previews, 16 frame JPGs from realstoman portfolio template."
