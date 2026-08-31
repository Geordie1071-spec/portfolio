"use client";

import { aboutMyself, aboutTechnologies } from "@/lib/about";
import { EMAIL, INITIALS, NAME } from "@/lib/site";

type ProfilePanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  return (
    <div
      className={`profile-overlay${open ? " is-open" : ""}`}
      aria-hidden={!open}
    >
      <button className="overlay-backdrop" onClick={onClose} tabIndex={open ? 0 : -1} aria-label="Close profile" />
      <div className="profile-card" role="dialog" aria-modal="true" aria-labelledby="profile-name">
        <button className="overlay-x" onClick={onClose} aria-label="Close profile" tabIndex={open ? 0 : -1}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="profile-avatar" aria-hidden="true">{INITIALS}</div>
        <h2 id="profile-name">{NAME}</h2>
        <p className="profile-role">Software developer · Web designer</p>
        <div className="profile-bio">
          {aboutMyself.lines.map((line) => (
            <p key={line.slice(0, 24)}>{line}</p>
          ))}
        </div>
        <p className="profile-tech">{aboutTechnologies.items.join("  /  ")}</p>
        <div className="profile-socials">
          <a href="#" aria-label="LinkedIn" className="social-bubble">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.36c0-1.28-.02-2.93-1.78-2.93-1.79 0-2.06 1.4-2.06 2.84V21H9z" /></svg>
          </a>
          <a href="#" aria-label="GitHub" className="social-bubble">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>
          </a>
          <a href="#" aria-label="X" className="social-bubble">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a href={`mailto:${EMAIL}`} aria-label="Email" className="social-bubble">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="M3 6l9 6.5L21 6" /></svg>
          </a>
        </div>
        <a href="#" className="btn-resume">Resume</a>
      </div>
    </div>
  );
}
