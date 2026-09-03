# Lattice v2

A 20-second cinematic Three.js reel of a platform architecture. Skip to any section as a page, play at 0.25×–2×, starts stopped.

## Controls

- **Play / Pause** — space
- **Skip section** — arrows, or the skip buttons, or the section chips (`#core`, `#play`, …)
- **Speed** — slider 0.25 to 2, or `,` / `.` (also `1` / `2` for 1× / 2×)
- **Restart** — R, stays stopped
- Each section has a real docs link under the title

## Sections

| Page | Shot | Link |
| --- | --- | --- |
| `#lattice` | Cube field | [Three.js](https://threejs.org) |
| `#core` | Chip dock | [WebGL on MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) |
| `#play` | Wheel | [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) |
| `#time` | Clock | [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) |
| `#pocket` | Handset | [Responsive canvas](https://threejs.org/manual/en/responsive.html) |
| `#split` | Share | [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) |
| `#crew` | Operators | [Lots of objects](https://threejs.org/manual/en/optimize-lots-of-objects.html) |
| `#floor` | Terminal | [Render on demand](https://threejs.org/manual/en/rendering-on-demand.html) |

## Stack

TanStack Start, React 19, Three.js, React Three Fiber, Tailwind v4, Zustand.

```sh
npm install
npm run dev
```
