# Suman — Portfolio

A single-page portfolio for Suman (freelance web developer) built with **React 19, Vite 6, TypeScript, and Tailwind CSS v4**.

The page is a scroll-linked showcase of five distinct visual systems:

1. **Cinematic Space** — hero + capabilities with background video
2. **Tactile Neumorphism** — interactive client-works department with live CSS filters
3. **Raw Brutalism** — channel-style project index with a "livestream" preview panel
4. **Neo-Brutalist Playground** — live budget calculator that drafts a `mailto:` inquiry
5. **Awwwards / Tubes** — experimental WebGL 3D tubes cursor + fine-art slider

Each layer uses its own custom cursor, is code-split with `React.lazy`, and is individually guarded by an `ErrorBoundary` so a failure in one section never blanks the page.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # outputs to dist/ (includes public/ 404.html)
npm run preview    # serve the production build
npm run lint       # tsc --noEmit
```

## Contact

Suman — `sumankd0000@gmail.com`