"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, PerspectiveCamera, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "@/lib/projects";

export type ProjectCarouselHandle = {
  step: (dir: number) => void;
};

type Props = {
  projects: Project[];
  paused: boolean;
  onOpen: (index: number) => void;
  onReady?: () => void;
};

const SCREEN_W = 5.12;
const SCREEN_H = 3.08;
const RADIUS = 9.1;
const STEP = 0.6;
const SEG_X = 36;
const SEG_Y = 18;

function wrapOffset(i: number, rot: number, n: number) {
  let off = i - rot;
  while (off > n / 2) off -= n;
  while (off < -n / 2) off += n;
  return off;
}

function bentGeometry() {
  const geo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H, SEG_X, SEG_Y);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const theta = x / RADIUS;
    pos.setX(i, RADIUS * Math.sin(theta));
    pos.setZ(i, RADIUS * (Math.cos(theta) - 1));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uSide;
  uniform float uSideHover;
  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 uv = vUv;
    vec2 delta = uv - uMouse;
    float dist = length(delta * vec2(1.0, 0.68));
    float bubble = exp(-dist * dist / 0.045) * uHover * (1.0 - uSide);
    uv -= delta * bubble * 0.22;

    vec4 tex = texture2D(uMap, uv);
    tex.rgb += bubble * 0.16;

    vec2 p = (vUv - 0.5) * 2.0;
    float sdf = roundedBox(p, vec2(1.0), 0.085);
    if (sdf > 0.0) discard;

    if (uSide > 0.5) {
      tex.rgb = mix(tex.rgb, vec3(1.0), uSideHover * 0.92);
    }

    gl_FragColor = vec4(tex.rgb, uOpacity);
  }
`;

type Motion = {
  rot: number;
  vel: number;
  snap: number | null;
  dragging: boolean;
  moved: boolean;
  lastX: number;
};

function CurvedScreen({
  project,
  index,
  n,
  motionRef,
  onOpen,
  paused,
  geometry,
}: {
  project: Project;
  index: number;
  n: number;
  motionRef: RefObject<Motion>;
  onOpen: (i: number) => void;
  paused: boolean;
  geometry: THREE.PlaneGeometry;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const hoverT = useRef(0);
  const hover = useRef(0);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useVideoTexture(project.previewVideo, {
    muted: true,
    loop: true,
    playsInline: true,
    start: false,
  });

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uOpacity: { value: 1 },
      uSide: { value: 0 },
      uSideHover: { value: 0 },
    }),
    [texture],
  );

  useFrame(() => {
    const motion = motionRef.current;
    const off = wrapOffset(index, motion.rot, n);
    const a = off * STEP;
    const abs = Math.abs(off);
    const isCenter = abs < 0.45;
    const sideScale = isCenter ? 1 : 0.86;
    if (mesh.current) {
      mesh.current.position.set(Math.sin(a) * RADIUS, 0.12, Math.cos(a) * RADIUS - RADIUS);
      mesh.current.rotation.set(0, a, 0);
      mesh.current.scale.set(1, sideScale, 1);
      mesh.current.visible = abs < 2.35;
    }
    hover.current += (hoverT.current - hover.current) * 0.14;
    const video = texture.image as HTMLVideoElement;
    const shouldPlay = !paused && Math.abs(off) < 0.85;
    if (video) {
      if (shouldPlay && video.paused) video.play().catch(() => {});
      else if (!shouldPlay && !video.paused) video.pause();
    }
    if (matRef.current) {
      matRef.current.uniforms.uMap.value.needsUpdate = true;
      matRef.current.uniforms.uHover.value = hover.current;
      matRef.current.uniforms.uMouse.value.copy(mouse.current);
      matRef.current.uniforms.uSide.value = isCenter ? 0 : 1;
      matRef.current.uniforms.uSideHover.value = isCenter ? 0 : hover.current;
      matRef.current.uniforms.uOpacity.value = abs < 0.2 ? 1 : abs < 1.15 ? 0.92 : Math.max(0, 1.15 - abs * 0.38);
    }
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      onPointerMove={(e) => {
        if (paused) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        e.stopPropagation();
        if (e.uv) mouse.current.set(e.uv.x, e.uv.y);
        hoverT.current = 1;
      }}
      onPointerOut={() => {
        hoverT.current = 0;
      }}
      onClick={(e) => {
        e.stopPropagation();
        const motion = motionRef.current;
        if (paused || motion.moved) return;
        const off = wrapOffset(index, motion.rot, n);
        if (Math.abs(off) < 0.45) onOpen(index);
        else {
          motion.vel = 0;
          motion.snap = motion.rot + off;
        }
      }}
    >
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        toneMapped={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function Rig() {
  const init = useRef(false);
  useFrame(({ camera }) => {
    if (init.current) return;
    camera.position.set(0, 0.72, 7.7);
    if ("fov" in camera) camera.fov = 32;
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
    init.current = true;
  });
  return null;
}

function CarouselWorld({
  projects,
  paused,
  onOpen,
  motionRef,
}: {
  projects: Project[];
  paused: boolean;
  onOpen: (i: number) => void;
  motionRef: RefObject<Motion>;
}) {
  const geometry = useMemo(() => bentGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const n = projects.length;

  useFrame((_, dt) => {
    if (paused) return;
    const motion = motionRef.current;
    const damp = Math.exp(-dt * 4.2);
    if (motion.dragging) return;

    if (motion.snap != null) {
      const d = motion.snap - motion.rot;
      motion.rot += d * Math.min(1, dt * 5.2);
      motion.vel = 0;
      if (Math.abs(d) < 0.003) {
        motion.rot = motion.snap;
        motion.snap = null;
      }
      return;
    }

    motion.vel *= damp;
    motion.rot += motion.vel;

    if (Math.abs(motion.vel) < 0.0025) {
      const nearest = Math.round(motion.rot);
      const d = nearest - motion.rot;
      motion.rot += d * Math.min(1, dt * 4.8);
      if (Math.abs(d) < 0.002) motion.rot = nearest;
    }

    const nWrap = projects.length;
    if (motion.rot > nWrap * 4 || motion.rot < -nWrap * 4) {
      motion.rot = ((motion.rot % nWrap) + nWrap) % nWrap;
    }
  });

  return (
    <>
      {projects.map((p, i) => (
        <CurvedScreen
          key={p.title}
          project={p}
          index={i}
          n={n}
          motionRef={motionRef}
          onOpen={onOpen}
          paused={paused}
          geometry={geometry}
        />
      ))}
    </>
  );
}

const ProjectCarousel = forwardRef<ProjectCarouselHandle, Props>(function ProjectCarousel(
  { projects, paused, onOpen, onReady },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const readySent = useRef(false);
  const motionRef = useRef<Motion>({
    rot: 0,
    vel: 0,
    snap: null,
    dragging: false,
    moved: false,
    lastX: 0,
  });
  const pausedRef = useRef(paused);
  const coarseRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    coarseRef.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  const notifyReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    onReady?.();
  }, [onReady]);

  useImperativeHandle(ref, () => ({
    step: (dir: number) => {
      const motion = motionRef.current;
      motion.vel = 0;
      const base = motion.snap ?? Math.round(motion.rot);
      motion.snap = base + dir;
    },
  }));

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      e.preventDefault();
      const motion = motionRef.current;
      motion.snap = null;
      motion.vel += (e.deltaY + e.deltaX) * 0.00011;
    };

    const onMove = (e: PointerEvent) => {
      const motion = motionRef.current;
      if (!motion.dragging) return;
      const dx = e.clientX - motion.lastX;
      if (Math.abs(dx) > 4) motion.moved = true;
      motion.rot -= dx / (coarseRef.current ? 1100 : 1600);
      motion.vel = -dx / (coarseRef.current ? 1100 : 1600) * 1.35;
      motion.lastX = e.clientX;
    };
    const onUp = () => {
      const motion = motionRef.current;
      motion.dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.setTimeout(() => {
        motion.moved = false;
      }, 40);
    };
    const onDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      const motion = motionRef.current;
      motion.dragging = true;
      motion.moved = false;
      motion.lastX = e.clientX;
      motion.snap = null;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const dprMax = 1.75;

  return (
    <div ref={wrapRef} className="carousel-stage">
      <p className="carousel-hint" aria-hidden="true">
        Drag or scroll to browse · Click side cards to switch
      </p>
      <Canvas
        dpr={[1, dprMax]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#222222", 1);
          requestAnimationFrame(() => {
            requestAnimationFrame(notifyReady);
          });
        }}
      >
        <color attach="background" args={["#222222"]} />
        <fog attach="fog" args={["#222222", 14, 34]} />
        <PerspectiveCamera makeDefault fov={32} position={[0, 0.72, 7.7]} />
        <ambientLight intensity={0.7} />
        <Rig />
        <Grid
          position={[0, -SCREEN_H / 2 - 0.45, 0]}
          args={[40, 40]}
          cellSize={0.55}
          cellThickness={0.42}
          cellColor="#333333"
          sectionSize={2.75}
          sectionThickness={0.72}
          sectionColor="#3d3d3d"
          fadeDistance={24}
          fadeStrength={1.65}
          infiniteGrid
        />
        <CarouselWorld projects={projects} paused={paused} onOpen={onOpen} motionRef={motionRef} />
      </Canvas>
    </div>
  );
});

export default ProjectCarousel;
