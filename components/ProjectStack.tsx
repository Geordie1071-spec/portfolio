"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Project } from "@/lib/projects";

export type ProjectStackHandle = {
  step: (dir: number) => void;
};

type Props = {
  projects: Project[];
  paused: boolean;
  onOpen: (index: number) => void;
  onReady?: () => void;
};

const COPIES = 5;

const ProjectStack = forwardRef<ProjectStackHandle, Props>(function ProjectStack(
  { projects, paused, onOpen, onReady },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const readySent = useRef(false);
  const cycleHeightRef = useRef(0);
  const jumpRef = useRef(false);

  const items = useMemo(
    () =>
      Array.from({ length: COPIES }, (_, copy) =>
        projects.map((project, index) => ({
          project,
          index,
          key: `${copy}-${project.title}`,
        })),
      ).flat(),
    [projects],
  );

  useImperativeHandle(ref, () => ({
    step: () => {},
  }));

  useEffect(() => {
    if (readySent.current) return;
    readySent.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;

    const measure = () => {
      cycleHeightRef.current = inner.scrollHeight / COPIES;
    };

    const center = () => {
      measure();
      jumpRef.current = true;
      root.scrollTop = cycleHeightRef.current * Math.floor(COPIES / 2);
      requestAnimationFrame(() => {
        jumpRef.current = false;
      });
    };

    center();

    const onScroll = () => {
      if (jumpRef.current) return;
      const cycle = cycleHeightRef.current;
      if (cycle <= 0) return;
      const st = root.scrollTop;
      const min = cycle * 0.75;
      const max = cycle * (COPIES - 0.75);
      if (st < min) {
        jumpRef.current = true;
        root.scrollTop = st + cycle;
        requestAnimationFrame(() => {
          jumpRef.current = false;
        });
      } else if (st > max) {
        jumpRef.current = true;
        root.scrollTop = st - cycle;
        requestAnimationFrame(() => {
          jumpRef.current = false;
        });
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, [projects.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll("video"));
    videos.forEach((video) => {
      if (paused) video.pause();
      else video.play().catch(() => {});
    });
  }, [paused]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll("video"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && !paused) video.play().catch(() => {});
          else video.pause();
        });
      },
      { root, threshold: 0.35 },
    );
    videos.forEach((video) => io.observe(video));
    return () => io.disconnect();
  }, [paused, items.length]);

  return (
    <div ref={rootRef} className={`project-stack${paused ? " is-paused" : ""}`}>
      <p className="stack-hint" aria-hidden="true">
        Scroll infinitely to browse · Tap to open
      </p>
      <div ref={innerRef} className="project-stack-inner">
        {items.map(({ project, index, key }, i) => (
          <button
            key={key}
            type="button"
            className="project-stack-card"
            style={{ zIndex: items.length - i }}
            onClick={() => onOpen(index)}
            aria-label={`Open ${project.title}`}
          >
            <video
              src={project.previewVideo}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          </button>
        ))}
      </div>
    </div>
  );
});

export default ProjectStack;
