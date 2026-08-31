"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "@/lib/projects";

export type ProjectCarouselHandle = {
  step: (dir: number) => void;
};

type Props = {
  projects: Project[];
  paused: boolean;
  onOpen: (index: number) => void;
};

const SCREEN_W = 5.35;
const SCREEN_H = 3.28;
const RADIUS = 8.2;
const STEP = 0.4;
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

function makeLabelTexture(p: Project) {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 800;
  const ctx = c.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(c);

  const g = ctx.createLinearGradient(0, 0, 1280, 800);
  g.addColorStop(0, "#101a3c");
  g.addColorStop(0.55, "#0b132c");
  g.addColorStop(1, "#15102e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 800);

  const vg = ctx.createRadialGradient(640, 400, 40, 640, 400, 720);
  vg.addColorStop(0, "rgba(43,71,255,0.18)");
  vg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 1280, 800);

  ctx.fillStyle = "#8fe9f2";
  roundRect(ctx, 520, 210, 240, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#12193b";
  ctx.font = "700 22px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.category.toUpperCase(), 640, 232);

  ctx.fillStyle = "#f3f4ff";
  ctx.font = "600 118px 'Tusker Grotesk', 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(p.title, 640, 400);

  ctx.fillStyle = "#9aa6cc";
  ctx.font = "600 28px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillText(`${p.year}  ·  ${p.role}`, 640, 490);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
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
  varying vec2 vUv;

  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 uv = vUv;
    vec2 delta = uv - uMouse;
    float dist = length(delta * vec2(1.0, 0.68));
    float bubble = exp(-dist * dist / 0.045) * uHover;
    uv -= delta * bubble * 0.22;

    vec4 tex = texture2D(uMap, uv);
    tex.rgb += bubble * 0.16;

    vec2 p = (vUv - 0.5) * 2.0;
    float sdf = roundedBox(p, vec2(1.0), 0.085);
    if (sdf > 0.0) discard;

    float border = 0.012;
    if (sdf > -border) {
      float k = smoothstep(0.0, -border, sdf);
      tex.rgb = mix(vec3(1.0), tex.rgb, k);
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

  const texture = useMemo(() => makeLabelTexture(project), [project]);
  useEffect(() => () => texture.dispose(), [texture]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uOpacity: { value: 1 },
    }),
    [texture],
  );

  useFrame(() => {
    const motion = motionRef.current;
    const off = wrapOffset(index, motion.rot, n);
    const a = off * STEP;
    if (mesh.current) {
      mesh.current.position.set(Math.sin(a) * RADIUS, 0.12, Math.cos(a) * RADIUS - RADIUS);
      mesh.current.rotation.set(0, a, 0);
      mesh.current.visible = Math.abs(off) < 2.35;
    }
    hover.current += (hoverT.current - hover.current) * 0.14;
    if (matRef.current) {
      matRef.current.uniforms.uHover.value = hover.current;
      matRef.current.uniforms.uMouse.value.copy(mouse.current);
      const abs = Math.abs(off);
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
  const { size } = useThree();
  useFrame(({ camera }) => {
    const z = size.width < 680 ? 8.4 : 6.35;
    camera.position.set(0, 0.72, z);
    camera.lookAt(0, 0.05, 0);
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
    const damp = Math.exp(-dt * 7.2);
    if (motion.dragging) return;

    if (motion.snap != null) {
      const d = motion.snap - motion.rot;
      motion.rot += d * Math.min(1, dt * 10);
      motion.vel = 0;
      if (Math.abs(d) < 0.003) {
        motion.rot = motion.snap;
        motion.snap = null;
      }
      return;
    }

    motion.vel *= damp;
    motion.rot += motion.vel;

    if (Math.abs(motion.vel) < 0.004) {
      const nearest = Math.round(motion.rot);
      const d = nearest - motion.rot;
      motion.rot += d * Math.min(1, dt * 8.5);
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
  { projects, paused, onOpen },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<Motion>({
    rot: 0,
    vel: 0,
    snap: null,
    dragging: false,
    moved: false,
    lastX: 0,
  });
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
      motion.vel += (e.deltaY + e.deltaX) * 0.00135;
    };

    const onMove = (e: PointerEvent) => {
      const motion = motionRef.current;
      if (!motion.dragging) return;
      const dx = e.clientX - motion.lastX;
      if (Math.abs(dx) > 4) motion.moved = true;
      motion.rot -= dx / 340;
      motion.vel = -dx / 340;
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

  return (
    <div ref={wrapRef} className="carousel-stage">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#070d24", 1);
        }}
      >
        <color attach="background" args={["#070d24"]} />
        <fog attach="fog" args={["#070d24", 10, 28]} />
        <PerspectiveCamera makeDefault fov={32} position={[0, 0.72, 6.35]} />
        <ambientLight intensity={0.55} />
        <Rig />
        <Grid
          position={[0, -SCREEN_H / 2 - 0.28, 0]}
          args={[40, 40]}
          cellSize={0.55}
          cellThickness={0.55}
          cellColor="#1c2a52"
          sectionSize={2.75}
          sectionThickness={1.05}
          sectionColor="#4a5d92"
          fadeDistance={22}
          fadeStrength={1.6}
          infiniteGrid
        />
        <CarouselWorld projects={projects} paused={paused} onOpen={onOpen} motionRef={motionRef} />
      </Canvas>
    </div>
  );
});

export default ProjectCarousel;
