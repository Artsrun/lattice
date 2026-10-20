import * as THREE from "three";

/**
 * Shadertoy → Three.js port notes (validated against r185 + Shadertoy player)
 *
 * TRUE
 * - Clip-space fullscreen quad: PlaneGeometry(2,2) + `gl_Position = vec4(position, 1.0)`.
 *   Common pattern (EffectComposer / fullscreen passes). Not a core “Shadertoy API”.
 * - Keep `mainImage(out vec4, in vec2)` and call it from `main`.
 * - `iResolution` is vec3(drawingBufferWidth, drawingBufferHeight, pixelAspect≈1).
 *   Use canvas.width/height after setPixelRatio — not CSS clientWidth.
 * - Shadertoy origin is bottom-left. Flip pointer Y.
 * - Force `fragColor.a = 1.0` if the toy leaves alpha unset.
 * - Mesh path: `mainImage(..., vUv * iResolution.xy)` with a fixed “virtual” resolution.
 * - `iChannel0..3` = `sampler2D` uniforms. Buffer A/B/C/D = ping-pong WebGLRenderTargets.
 * - GLSL3 toys: `glslVersion: THREE.GLSL3` and `out vec4 fragColor` (no gl_FragColor).
 *
 * PARTIAL / CORRECTED
 * - iMouse: xy = current pixel. zw = click origin.
 *   Click frame: z>0 and w>0. Held: z>0 and w<0. Released: z<0 and w<0.
 *   The paste kept zw positive on release — Shadertoy stores the negative.
 * - Channel wrap/filter: Shadertoy lets you pick per-channel.
 *   Default is often linear + clamp, not nearest + repeat.
 * - `THREE.Clock` is deprecated in r185 (`@deprecated` → `THREE.Timer`).
 *   Drive time from the frame loop (R3F delta).
 * - `autoClear = false` only matters when compositing extra passes.
 * - three-shadertoy-material@1.3.9 (~2017) and three-shadertoy-texture are
 *   prototype helpers, not maintained against r185. Wrap yourself.
 *
 * FALSE / STALE
 * - “Official Three.js Shadertoy helper” — there isn’t one in core.
 */

export const CLIP_VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

export const MESH_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export type ShadertoyUniforms = {
  iResolution: { value: THREE.Vector3 };
  iTime: { value: number };
  iTimeDelta: { value: number };
  iFrame: { value: number };
  iMouse: { value: THREE.Vector4 };
  uMix: { value: number };
};

export type ShadertoyPointer = {
  x: number;
  y: number;
  clickX: number;
  clickY: number;
  down: boolean;
  justDown: boolean;
};

type WrapOpts = {
  mesh?: boolean;
  glsl3?: boolean;
};

export function wrapMainImage(mainImage: string, opts: WrapOpts = {}) {
  const coords = opts.mesh ? "vUv * iResolution.xy" : "gl_FragCoord.xy";
  const vary = opts.mesh ? "varying vec2 vUv;" : "";
  if (opts.glsl3) {
    return /* glsl */ `
      uniform vec3 iResolution;
      uniform float iTime;
      uniform float iTimeDelta;
      uniform int iFrame;
      uniform vec4 iMouse;
      uniform float uMix;
      ${vary}
      out vec4 fragColor;
      ${mainImage}
      void main() {
        vec4 col;
        mainImage(col, ${coords});
        col.a = 1.0;
        fragColor = col;
      }
    `;
  }
  return /* glsl */ `
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float iTimeDelta;
    uniform int iFrame;
    uniform vec4 iMouse;
    uniform float uMix;
    ${vary}
    ${mainImage}
    void main() {
      mainImage(gl_FragColor, ${coords});
      gl_FragColor.a = 1.0;
    }
  `;
}

export function createShadertoyUniforms(): ShadertoyUniforms {
  return {
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    iTime: { value: 0 },
    iTimeDelta: { value: 0 },
    iFrame: { value: 0 },
    iMouse: { value: new THREE.Vector4() },
    uMix: { value: 1 },
  };
}

export function createShadertoyMaterial(mainImage: string, opts: WrapOpts = {}) {
  const uniforms = createShadertoyUniforms();
  return new THREE.ShaderMaterial({
    vertexShader: opts.mesh ? MESH_VERTEX : CLIP_VERTEX,
    fragmentShader: wrapMainImage(mainImage, opts),
    uniforms,
    depthTest: false,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    transparent: false,
    side: THREE.DoubleSide,
    glslVersion: opts.glsl3 ? THREE.GLSL3 : THREE.GLSL1,
  });
}

export function setShadertoyResolution(
  uniforms: ShadertoyUniforms,
  drawingWidth: number,
  drawingHeight: number,
) {
  uniforms.iResolution.value.set(drawingWidth, drawingHeight, 1);
}

export function tickShadertoy(uniforms: ShadertoyUniforms, time: number, dt: number) {
  uniforms.iTime.value = time;
  uniforms.iTimeDelta.value = dt;
  uniforms.iFrame.value += 1;
}

export function createShadertoyPointer(): ShadertoyPointer {
  return { x: 0, y: 0, clickX: 0, clickY: 0, down: false, justDown: false };
}

export function feedShadertoyPointer(
  pointer: ShadertoyPointer,
  x: number,
  y: number,
  down: boolean,
  isDownEvent: boolean,
) {
  pointer.x = x;
  pointer.y = y;
  if (isDownEvent) {
    pointer.clickX = x;
    pointer.clickY = y;
    pointer.down = true;
    pointer.justDown = true;
    return;
  }
  pointer.down = down;
}

/**
 * Shadertoy iMouse (player, post-2020):
 *   xy current (Y-up pixels)
 *   click frame  z>0 w>0
 *   held         z>0 w<0
 *   released     z<0 w<0
 */
export function syncShadertoyMouse(uniforms: ShadertoyUniforms, pointer: ShadertoyPointer) {
  const m = uniforms.iMouse.value;
  m.x = pointer.x;
  m.y = pointer.y;
  if (pointer.down && pointer.justDown) {
    m.z = pointer.clickX;
    m.w = pointer.clickY;
    pointer.justDown = false;
  } else if (pointer.down) {
    m.z = pointer.clickX;
    m.w = -Math.abs(pointer.clickY);
  } else {
    m.z = -Math.abs(pointer.clickX);
    m.w = -Math.abs(pointer.clickY);
  }
}

/** Simpler down/up helper — release already stores negative zw. */
export function setShadertoyMouse(
  uniforms: ShadertoyUniforms,
  x: number,
  y: number,
  down: boolean,
  clickX: number,
  clickY: number,
) {
  const m = uniforms.iMouse.value;
  m.x = x;
  m.y = y;
  if (down) {
    m.z = clickX;
    m.w = clickY;
  } else {
    m.z = -Math.abs(clickX);
    m.w = -Math.abs(clickY);
  }
}

export function pointerToShadertoy(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / Math.max(1, r.width);
  const sy = canvas.height / Math.max(1, r.height);
  return {
    x: (clientX - r.left) * sx,
    y: (r.bottom - clientY) * sy,
  };
}
