# Geordie Ellis — Portfolio

A cinematic, scene-based portfolio site built with Next.js (App Router) and TypeScript. Instead of a scrolling page, the site is a fixed-viewport "deck" of five swipeable scenes — Hero, Projects, About, Skills, and Footer/Contact — navigated by wheel, touch swipe, arrow keys, or the on-screen nav.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router), React, TypeScript
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling inside the project detail overlay
- Custom fonts: Gasoek One, Plus Jakarta Sans, Newsreader (Google Fonts) and Tusker Grotesk (local webfont)

## Structure

- `components/Portfolio.tsx` — the entire scene-deck experience (loader, nav, 5 scenes, project detail overlay, custom cursor)
- `lib/projects.ts` — project case-study data
- `lib/tools.ts` — skills/tools shown in the Skills scene
- `lib/logoPaths.ts` — shared SVG path data for the logo mark (used by the nav, loader shatter animation, and footer assemble animation)
