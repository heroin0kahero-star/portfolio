# Mobile Fix Plan

## Breakpoint
- Use `max-width: 767px` (same as existing codebase uses - matches "below 768px", and all existing media queries use 767px). Also use `window.matchMedia('(max-width: 767px)')` in JS where needed.
- For HowWeWork, JS already has `phoneViewport()` checking `'(max-width: 767px)'` and passes it around. Good.

## How We Work Together - Mobile Fixes

### 1. Sizing & Layout
- Section must be 100vw x 100svh (use dvh where svh not supported) with overflow hidden. Ensure no horizontal scroll (`document.documentElement.scrollWidth === clientWidth`).
- In CSS, `.hww` already uses `height: 100svh; min-height: 100svh; overflow: hidden;` - need to ensure on mobile it uses dvh fallback? The requirement says "use dvh where svh isn't supported". Modern browsers support svh; maybe add dvh as fallback: `height: 100dvh; height: 100svh;` etc. Also need to ensure the section/wrapper don't cause horizontal scroll.
- In `index.css` we have `html, body { overflow-x: clip; }` which is good.

### 2. Camera & FOV/Distance (Portrait aspect < 1)
- On portrait (aspect < 1), set `camera.aspect` from canvas size on every resize, adjust FOV or camera distance so card group spans ~75-85% of viewport width.
- In `path.js`, `fit(aspect)` computes card sizes based on `halfW = halfH * aspect` where `halfH = focusDistance * tan(FOV_RAD/2)`. Also sets `kx, ky` scaling factors. Currently `cardW = Math.min(CARD_W_MAX, 1.56 * halfW)`. On portrait (narrow width), `halfW` becomes small relative to height, so cards get small - this matches the bug (cards tiny in middle). Also camera position is set by `camZ(p) = getCamZStart() - p*travel` where `getCamZStart() = focusDistance + lead`. To make cards span larger portion of width on portrait, we need to either increase card scale or adjust FOV/camera. The requirement says "adjust FOV or camera distance so the card group spans about 75 to 85% of viewport width. Derive the scale from the viewport width; don't hard-code pixel values."
- So in mobile/portrait case, we need to modify `fit()` or the camera setup. Also in `HowWeWork.js`, camera is created with fixed FOV from constants. We can change FOV on mobile or change how scaling works.
- Also need to recompute on resize/orientation change. `fit()` is called in `resize()` and on init.

### 3. Card Size
- On mobile each card ~72vw wide. Body text >= 14px. Every card fully inside viewport horizontally in every stage including when tilted.
- In `cards.js`, on mobile it uses `PHONE` layout for canvas texture (1024x640). The 3D card geometry is `PlaneGeometry(cardW, cardH)` where `cardW/cardH` come from `path.js` via `fit()`. So to make cards ~72vw wide in screen space, we need to scale the 3D card size appropriately. Also need to ensure cards don't go off-screen even when tilted - tilts are small (-0.014 etc) but combined with positioning maybe an issue.
- Also in CSS/DOM, no - cards are in WebGL.

### 4. Spacing/Path
- On mobile, cards overlap less. Use smaller horizontal offset and larger vertical offset, with mobile-specific path variables. Keep depth motion and stage order.
- In `path.js`, `BASE_X` and `BASE_Y` define the zigzag. `kx, ky` scale them. Also `CARD_GAP` affects spacing in z. On mobile we need different tuning - maybe reduce horizontal variation (smaller kx effect) and increase vertical offset variation? Or adjust BASE_X/BASE_Y scaling differently.

### 5. Pencil Line
- Rebuild path from cards' projected screen positions after layout. Recompute on mount, resize, orientation change, after ScrollTrigger.refresh(). Must start inside viewport never above top edge, end at active card's corner. Scale thickness down for mobile (4-6px on screen).
- Currently pencil is built in 3D space along the path (`samplePencil` uses `pathX/Y/tubeZ`). The problem says "rebuild its path from the cards' projected screen positions" - so different approach on mobile. Also says "end at the active card's corner" - currently pencil tip follows camera/progress; maybe need to make it attach to card corners based on projection.
- This is a bigger change to pencil.js/how it's computed.

### 6. HUD (stage counter, progress bars) - stay visible, never overlap card. Add padding for safe-area-inset-bottom.
- In CSS `.hww__hud` needs safe area padding. Also ensure on mobile it doesn't overlap.

### 7. Resize handling
- Observe section with ResizeObserver, update renderer size/camera/card layout, call ScrollTrigger.refresh(). Don't rely on 100vh.
- HowWeWork.js already uses ResizeObserver on section and also calls resize() in various places. Need to ensure it also calls ScrollTrigger.refresh() appropriately on resize/orientation.

### 8. Performance
- Cap renderer pixelRatio at 1.5 on mobile, reduce geometry segments where not needed.
- Currently MAX_DPR is 2 globally; on mobile cap at 1.5. Also pencil uses RADIAL=8 segments - maybe reduce on mobile. Cards use canvas textures which is fine.

## About Me Portrait (mobile)
- Portrait container width 80vw (max 460px), centered both ways, height from image's aspect ratio.
- Current CSS does this mostly. But check - portrait-3 is the 3D one (stage 03). The requirement says "About Me, stage 03 / 03: The 3D portrait is about 60% of the screen width. Target: 80vw." Also "Portrait container: width 80vw (max 460px), centered both ways, with height from the image's aspect ratio."
- Also "If the 3D portrait image has transparent padding, trim the asset to the figure's bounding box so the figure actually fills the 80vw container. Don't just scale the box up." - need to handle portrait-3 specially. Maybe use `object-fit: contain` vs cover, or adjust object-position, or crop. Or modify the image processing - but easier to fix with CSS/object positioning. Also might need to use different sizing.
- "Keep the cards layered above the portrait. The face (eyes to chin) must never be covered at any width."
- "On an element that GSAP animates, center with flex or top/left offsets, not a CSS transform." - portraits are animated by GSAP for zoom (scale transform). The requirement says "On an element that GSAP animates, center with flex or top/left offsets, not a CSS transform." So we need to not use CSS transform for centering on elements GSAP animates. But how? Maybe restructure positioning.

Files to change:
**How We Work:**
- `src/sections/how-we-work/how-we-work.css` - mobile styles
- `src/sections/how-we-work/HowWeWork.js` - resize/camera/mobile handling
- `src/sections/how-we-work/path.js` - mobile path/camera fitting
- `src/sections/how-we-work/cards.js` - mobile card sizing
- `src/sections/how-we-work/pencil.js` - mobile pencil rendering
- Possibly `src/sections/how-we-work/constants.js` for mobile values

**About:**
- `src/components/about/about.css` - mobile portrait sizing
- Possibly `src/components/AboutSection.tsx` if needed for positioning/GSAP
