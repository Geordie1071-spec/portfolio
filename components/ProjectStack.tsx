"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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

const ProjectStack = forwardRef<ProjectStackHandle, Props>(function ProjectStack(
  { projects, paused, onOpen, onReady },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readySent = useRef(false);

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
  }, [paused, projects.length]);

  return (
    <div ref={rootRef} className={`project-stack${paused ? " is-paused" : ""}`}>
      <div className="project-stack-inner">
        {projects.map((project, index) => (
          <button
            key={project.title}
            type="button"
            className="project-stack-card"
            style={{ zIndex: projects.length - index }}
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
