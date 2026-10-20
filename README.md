# Lattice v4

A 20-second cinematic Three.js reel of a platform architecture. Skip to any section as a page, play at 0.25×–2×, starts stopped. **Shade** is a skippable clip-space Shadertoy field — original cheap 2D GLSL, not a city SDF paste.

## Controls

- **Play / Pause** — space. Play leaves Shade and returns to the reel.
- **Skip section** — arrows, skip buttons, or the section chips (`#lattice`, `#shade`, `#core`, …)
- **Speed** — slider 0.25 to 2, or `,` / `.` (also `1` / `2` for 1× / 2×)
- **Restart** — R, stays stopped
- Each section has a real docs link under the title
- On **Shade**, drag to move the focus (`iMouse`)

## Sections

| Page | Shot | Link |
| --- | --- | --- |
| `#lattice` | Cube field | [Three.js](https://threejs.org) |
| `#shade` | Clip-space field | [The Book of Shaders](https://thebookofshaders.com) |
| `#core` | Chip dock | [WebGL on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) |
| `#play` | Wheel | [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) |
| `#time` | Clock | [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) |
| `#pocket` | Handset | [Responsive canvas](https://threejs.org/manual/en/responsive.html) |
| `#split` | Share | [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) |
| `#crew` | Operators | [Lots of objects](https://threejs.org/manual/en/optimize-lots-of-objects.html) |
| `#floor` | Terminal | [Render on demand](https://threejs.org/manual/en/rendering-on-demand.html) |

## Shadertoy port (what we kept / corrected)

Fullscreen path: `PlaneGeometry(2, 2)` + clip-space vertex `gl_Position = vec4(position, 1.0)`, keep `mainImage`, wrap in `main`, drive `iResolution` from the drawing buffer, flip mouse Y.

| Claim | Verdict |
| --- | --- |
| Clip-space 2×2 quad | True — community/EffectComposer pattern, **not** a core Three.js Shadertoy API |
| Keep `mainImage` | True |
| `iResolution` drawing-buffer pixels | True (`canvas.width/height` after DPR, not CSS size) |
| Flip mouse Y | True (Shadertoy origin is bottom-left) |
| Force alpha 1 | True if the toy leaves alpha unset |
| Mesh path `vUv * iResolution` | True, with a fixed virtual resolution |
| `iChannel` + ping-pong buffers | True |
| GLSL3 via `THREE.GLSL3` | True |
| `iMouse.zw` on release | **Corrected** — Shadertoy stores the *negative* click; click frame is `z>0,w>0`, held `z>0,w<0` |
| Channel wrap = nearest + repeat | **Partial** — per-channel; default is often linear + clamp |
| `THREE.Clock` | **Stale** — deprecated in r185, use the frame delta |
| `autoClear = false` | **Partial** — only for extra passes |
| Official Shadertoy helper | **False** — none in core |
| `three-shadertoy-material` / `-texture` | **Stale** — prototype-era, not for r185 |

City/SDF Shadertoy ports are per-pixel raymarchers; they tank vs real geometry. Shade stays a cheap lattice field. DPR is capped at 1.6.

## Stack

TanStack Start, React 19, Three.js r185, React Three Fiber, Tailwind v4, Zustand.

```sh
npm install
npm run dev
```
