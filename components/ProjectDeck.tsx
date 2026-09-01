"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { useMobileDeck } from "@/lib/useMobileDeck";
import type { ProjectCarouselHandle } from "./ProjectCarousel";
import ProjectStack from "./ProjectStack";
import type { Project } from "@/lib/projects";

export type ProjectDeckHandle = ProjectCarouselHandle;

const ProjectCarousel = dynamic(() => import("./ProjectCarousel"), { ssr: false });

type Props = {
  projects: Project[];
  paused: boolean;
  onOpen: (index: number) => void;
  onReady?: () => void;
};

const ProjectDeck = forwardRef<ProjectDeckHandle, Props>(function ProjectDeck(props, ref) {
  const mobile = useMobileDeck();

  if (mobile) {
    return <ProjectStack ref={ref} {...props} />;
  }

  return <ProjectCarousel ref={ref} {...props} />;
});

export default ProjectDeck;
