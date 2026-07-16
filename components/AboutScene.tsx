"use client";

import { useEffect, type RefObject } from "react";
import { aboutMyself, aboutTechnologies } from "@/lib/about";

type AboutSceneProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function AboutScene({ scrollRef }: AboutSceneProps) {
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay || 0);
          window.setTimeout(() => el.classList.add("is-in"), delay);
          io.unobserve(el);
        }
      },
      {
        root,
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scrollRef]);

  return (
    <div ref={scrollRef} className="about-scroll">
      <div className="about-simple">
        <section className="about-block">
          <p className="about-kicker" data-reveal data-reveal-delay="0">
            {aboutMyself.label}
          </p>
          <div className="about-statement">
            {aboutMyself.lines.map((line, i) => (
              <p
                key={line.slice(0, 32)}
                data-reveal
                data-reveal-delay={80 + i * 120}
              >
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="about-block about-block-tech">
          <p className="about-kicker" data-reveal data-reveal-delay="0">
            {aboutTechnologies.label}
          </p>
          <p className="about-tech-line" data-reveal data-reveal-delay="100">
            {aboutTechnologies.items.join(" / ")}
          </p>
        </section>
      </div>
    </div>
  );
}
