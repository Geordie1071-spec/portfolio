import * as THREE from "three";

export function makePlaceholderTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 4;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, 4, 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPreviewVideo(src: string) {
  const video = document.createElement("video");
  video.src = src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";
  return video;
}

export function createVideoTexture(video: HTMLVideoElement) {
  const tex = new THREE.VideoTexture(video);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}
