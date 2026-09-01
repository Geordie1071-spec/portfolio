# Geordie Ellis — Portfolio

A cinematic projects-only portfolio built with Next.js (App Router), React Three Fiber, and TypeScript. After a logo-assembly loader, the site is a single infinite 3D carousel of curved project screens. Profile and case-study detail open as overlays.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router), React, TypeScript
- [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei) for the cylindrical project carousel
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling inside the project detail overlay
- Custom fonts: Gasoek One, Plus Jakarta Sans, Newsreader (Google Fonts) and Tusker Grotesk (local webfont)

## Structure

- `components/Portfolio.tsx` — shell (chrome, cursor, overlay wiring)
- `components/ProjectCarousel.tsx` — infinite 3D curved-screen carousel
- `components/ProjectDetail.tsx` — white-card case study overlay
- `components/ProfilePanel.tsx` — centered profile overlay
- `components/Loader.tsx` — shard assembly + iris reveal
- `lib/projects.ts` — project case-study data
- `lib/about.ts` — profile copy
- `lib/logoPaths.ts` — SVG path data for the logo mark
