# Suman — Portfolio

A single-page portfolio for Suman (freelance web developer) built with **React 19, Vite 6, TypeScript, and Tailwind CSS v4**.

The page tells one clear story:

1. **Hero** — who Suman is and what he builds
2. **About** — a pinned, scroll-driven three-stage portrait story
3. **Capabilities** — websites, SEO, ads, social media, and enquiries
4. **Pricing** — four INR packages plus a live estimate customizer
5. **Live builds** — three real client sites
6. **Process** — brief, design, build, launch
7. **Contact** — email and WhatsApp

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Copy `.env.example` to `.env` and set `VITE_WHATSAPP_NUMBER` (country code, digits only) to enable the WhatsApp link. Without it, the link still opens WhatsApp with the prefilled message.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build
npm run lint       # tsc --noEmit
```

## Contact

Suman — `sumankd0000@gmail.com`
