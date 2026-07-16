"use client";

import type { RefObject } from "react";
import Reveal from "./Reveal";
import { aboutMyself, aboutTechnologies } from "@/lib/about";

type AboutSceneProps = {
  revealed: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ revealed, scrollRef }: AboutSceneProps) {
  return (
    <div ref={scrollRef} className="about-scroll">
      <div className="about-simple">
        <section className="about-block">
          <Reveal revealed={revealed} className="about-kicker">
            {aboutMyself.label}
          </Reveal>
          <div className="about-statement">
            {aboutMyself.lines.map((line, i) => (
              <Reveal
                key={line.slice(0, 32)}
                revealed={revealed}
                className="about-line"
                style={{ transitionDelay: revealed ? `${0.1 + i * 0.14}s` : "0s" }}
              >
                {line}
              </Reveal>
            ))}
          </div>
        </section>

        <section className="about-block about-block-tech">
          <Reveal
            revealed={revealed}
            className="about-kicker"
            style={{ transitionDelay: revealed ? "0.55s" : "0s" }}
          >
            {aboutTechnologies.label}
          </Reveal>
          <Reveal
            revealed={revealed}
            className="about-tech-line"
            style={{ transitionDelay: revealed ? "0.68s" : "0s" }}
          >
            {aboutTechnologies.items.join(" / ")}
          </Reveal>
        </section>
      </div>
    </div>
  );
}
