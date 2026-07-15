import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** True once the owning scene has been entered at least once — stays true after. */
  revealed: boolean;
};

/**
 * Text wipes upward into view the first time its scene is entered (matches
 * the prototype's clip-path reveal), then stays visible. Controlled by the
 * parent scene deck rather than IntersectionObserver, since reveal timing
 * here is tied to scene entry, not real scroll position.
 */
export default function Reveal({ as: Tag = "div", children, className, style, revealed }: RevealProps) {
  return (
    <Tag className={`${revealed ? "reveal-visible" : "reveal-hidden"}${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </Tag>
  );
}
