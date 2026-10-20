/** Original Lattice field — cheap 2D, not a Shadertoy paste, not a raymarched city. */
export const LATTICE_IMAGE = /* glsl */ `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 res = iResolution.xy;
  vec2 uv = (fragCoord - 0.5 * res) / res.y;
  float t = iTime * 0.28;

  vec2 mouse = (iMouse.xy - 0.5 * res) / res.y;
  float hasMouse = step(1.0, abs(iMouse.z));
  vec2 focus = mix(vec2(sin(t * 0.7) * 0.35, cos(t * 0.5) * 0.22), mouse, hasMouse);

  float zoom = 4.6 + 0.35 * sin(t * 0.4);
  float ca = cos(t * 0.05);
  float sa = sin(t * 0.05);
  vec2 p = mat2(ca, -sa, sa, ca) * (uv * zoom);
  p += vec2(t * 0.15, t * 0.08);

  vec2 gv = fract(p) - 0.5;
  vec2 id = floor(p);
  float n = fract(sin(dot(id, vec2(27.1, 91.7))) * 43758.5453);
  float pulse = 0.5 + 0.5 * sin(t * 2.1 + n * 6.2831);

  vec2 box = abs(gv);
  float d = max(box.x, box.y);
  float cell = smoothstep(0.36, 0.31, d) * smoothstep(0.18, 0.24, d);
  float fill = smoothstep(0.22, 0.16, d) * pulse;

  float dist = length(uv - focus);
  float glow = exp(-2.8 * dist);
  float ring = 1.0 - smoothstep(0.0, 0.05, abs(dist - 0.18));

  vec3 bg = vec3(0.027, 0.078, 0.157);
  vec3 cyan = vec3(0.369, 0.784, 0.941);
  vec3 ice = vec3(0.847, 0.933, 0.973);
  vec3 gold = vec3(0.878, 0.635, 0.227);

  vec3 col = bg;
  col += cyan * cell * (0.22 + 0.55 * glow);
  col += ice * fill * (0.18 + 0.65 * glow);
  col += cyan * glow * 0.16;
  col += gold * ring * (0.35 + 0.4 * glow);

  col = mix(bg, col, clamp(uMix, 0.0, 1.0));
  fragColor = vec4(col, 1.0);
}
`;
