"use client";

import { useEffect, useMemo, useState } from "react";
import LetterMorph from "@/components/LetterMorph";
import { ACCENT_PRESETS, useAccent } from "@/lib/accent";
import type { Project } from "@/lib/projects";

const DEFAULT_TITLE = "GEORDIE";

type Thumb = {
  key: string;
  projectIndex: number;
  title: string;
  src: string;
  alt: string;
};

type Props = {
  projects: Project[];
  onOpen: (index: number) => void;
  onReady?: () => void;
};

export default function HomeGallery({ projects, onOpen, onReady }: Props) {
  const { accentId, setAccentId } = useAccent();
  const [active, setActive] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const thumbs = useMemo<Thumb[]>(() => {
    return projects.map((project, projectIndex) => {
      const cover = project.pages.find((page) => !!page.img);
      return {
        key: project.title,
        projectIndex,
        title: project.title,
        src: cover?.img ?? "",
        alt: project.title,
      };
    }).filter((thumb) => !!thumb.src);
  }, [projects]);

  const headline = active == null ? DEFAULT_TITLE : thumbs[active]?.title ?? DEFAULT_TITLE;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest(".home-accent")) return;
      setPickerOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [pickerOpen]);

  return (
    <div className="home-gallery">
      <div className="home-gallery-stage">
        <div className="home-thumbs" onMouseLeave={() => setActive(null)}>
          {thumbs.map((thumb, i) => {
            const hot = active === i;
            return (
              <button
                key={thumb.key}
                type="button"
                className={`home-thumb${hot ? " is-hot" : ""}${active != null && !hot ? " is-dim" : ""}`}
                data-home-thumb=""
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => onOpen(thumb.projectIndex)}
                aria-label={`Open ${thumb.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local project frames */}
                <img src={thumb.src} alt="" draggable={false} />
              </button>
            );
          })}
        </div>

        <LetterMorph
          text={headline}
          className="home-title"
          style={{
            fontSize: `clamp(72px, ${Math.min(24, 155 / Math.max(headline.replace(/\s/g, "").length, 1))}vw, 280px)`,
          }}
        />
      </div>

      <div className="home-dock">
        <div className={`home-accent${pickerOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="home-accent-trigger"
            aria-label="Choose accent color"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((v) => !v)}
          >
            <span className="home-accent-swatch" style={{ background: "var(--accent)" }} />
            <span className="home-accent-label">Color</span>
          </button>
          <div className="home-accent-menu" role="listbox" aria-label="Accent colors">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={accentId === preset.id}
                className={`home-accent-option${accentId === preset.id ? " is-active" : ""}`}
                style={{ background: preset.value }}
                aria-label={preset.label}
                onClick={() => {
                  setAccentId(preset.id);
                  setPickerOpen(false);
                }}
              />
            ))}
          </div>
        </div>

        <div className="home-location" aria-label="Location">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span>Gozo, Malta</span>
        </div>
      </div>
    </div>
  );
}
