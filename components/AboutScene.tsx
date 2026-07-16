"use client";

import type { RefObject } from "react";
import { aboutMyself, aboutTechnologies } from "@/lib/about";

type AboutSceneProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ scrollRef }: AboutSceneProps) {
  return (
    <div ref={scrollRef} className="about-scroll">
      <div className="about-simple">
        <section className="about-block">
          <p className="about-kicker">{aboutMyself.label}</p>
          <p className="about-statement">{aboutMyself.body}</p>
        </section>

        <section className="about-block">
          <p className="about-kicker">{aboutTechnologies.label}</p>
          <p className="about-tech-line">
            {aboutTechnologies.items.join(" / ")}
          </p>
        </section>
      </div>
    </div>
  );
}
