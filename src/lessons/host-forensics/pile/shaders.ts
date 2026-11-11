/* =========================================================================
   PILE SHADERS
   =========================================================================
   Two passes.

   1. TRAIL (ping-pong, low resolution). Each texel stores what has happened
      to the pile above it:
        rg  the direction the fibres were pushed, encoded 0..1
        b   fresh crush, which springs back over a few seconds
        a   residue, which never springs back
      Feet, the pointer and the vacuum write into it. Nothing ever clears it.

   2. PILE (full screen). Office carpet tiles laid quarter-turned, so every
      other tile catches the light differently. Fibre noise, tuft rows and a
      heathered yarn give the material; the trail tilts the nap, and a raking
      lamp turns that tilt into visible sheen.
   ========================================================================= */

export const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const common = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`

export const trailFragment = /* glsl */ `
precision highp float;
uniform sampler2D tPrev;
uniform vec2 uRes;          // layer size, css px
uniform float uDecay;       // multiplier for fresh crush this frame
uniform vec4 uBrush;        // from.xy, to.xy (px)
uniform vec2 uBrushDir;
uniform float uBrushR;
uniform float uBrushOn;
uniform vec4 uStamps[6];    // x, y, angle, side (0 = empty)
uniform float uStampLen;
uniform float uStampFresh;
uniform vec4 uVac;          // x0, y0, x1, y1 (px) swept this frame
uniform vec2 uVacDir;
uniform float uVacOn;
varying vec2 vUv;

float ellipse(vec2 p, vec2 r) {
  vec2 q = p / r;
  return 1.0 - smoothstep(0.82, 1.0, dot(q, q));
}

// A shoe sole: forefoot and heel, a narrow waist, cross-tread.
float sole(vec2 p, float len, float side) {
  vec2 q = vec2(p.x, p.y * side);
  float fore = ellipse(q - vec2(len * 0.17, len * 0.02), vec2(len * 0.31, len * 0.175));
  float waist = ellipse(q - vec2(-len * 0.08, len * 0.035), vec2(len * 0.2, len * 0.09));
  float heel = ellipse(q - vec2(-len * 0.31, 0.0), vec2(len * 0.16, len * 0.13));
  float s = max(max(fore, heel), waist * 0.85);
  float tread = 0.72 + 0.28 * step(0.0, sin(q.x / len * 44.0));
  return s * tread;
}

void main() {
  vec4 prev = texture2D(tPrev, vUv);
  vec2 dir = prev.rg * 2.0 - 1.0;
  float fresh = prev.b * uDecay;
  float residue = prev.a;
  vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);

  // Pointer brush: a soft capsule along the pointer's path.
  if (uBrushOn > 0.5) {
    vec2 a = uBrush.xy;
    vec2 b = uBrush.zw;
    vec2 ab = b - a;
    float t = clamp(dot(px - a, ab) / max(dot(ab, ab), 1e-3), 0.0, 1.0);
    float d = length(px - (a + ab * t));
    float k = 1.0 - smoothstep(uBrushR * 0.35, uBrushR, d);
    if (k > 0.001) {
      dir = mix(dir, uBrushDir, k * 0.85);
      fresh = max(fresh, k * 0.9);
      residue = max(residue, k * 0.12);
    }
  }

  // Footprints.
  for (int i = 0; i < 6; i++) {
    vec4 s = uStamps[i];
    if (abs(s.w) < 0.5) continue;
    vec2 d = px - s.xy;
    float c = cos(-s.z);
    float sn = sin(-s.z);
    vec2 local = vec2(d.x * c - d.y * sn, d.x * sn + d.y * c);
    float k = sole(local, uStampLen, s.w);
    if (k > 0.001) {
      vec2 fwd = vec2(cos(s.z), sin(s.z));
      dir = mix(dir, vec2(fwd.x, -fwd.y), k);
      fresh = max(fresh, k * uStampFresh);
      residue = max(residue, k * 0.75);
    }
  }

  // The vacuum: lays the pile flat in one direction across its lane. The
  // prints under it are gone; the stripe it leaves is not.
  if (uVacOn > 0.5) {
    vec2 lo = min(uVac.xy, uVac.zw);
    vec2 hi = max(uVac.xy, uVac.zw);
    float inX = smoothstep(lo.x - 1.0, lo.x + 2.0, px.x) * (1.0 - smoothstep(hi.x - 2.0, hi.x + 1.0, px.x));
    float inY = step(lo.y, px.y) * step(px.y, hi.y);
    float k = inX * inY;
    if (k > 0.001) {
      dir = mix(dir, uVacDir, k);
      fresh = mix(fresh, 0.5, k);
      residue = mix(residue, 0.34, k);
    }
  }

  gl_FragColor = vec4(dir * 0.5 + 0.5, clamp(fresh, 0.0, 1.0), clamp(residue, 0.0, 1.0));
}
`

export const pileFragment = /* glsl */ `
precision highp float;
uniform sampler2D tTrail;
uniform vec2 uRes;
uniform vec2 uLight;        // lamp position, css px
uniform float uLightPower;
uniform float uTile;
uniform float uQuiet;       // 0 projected .. 1 reading page
uniform vec3 uPetrolA;
uniform vec3 uPetrolB;
uniform vec3 uPlumA;
uniform vec3 uPlumB;
uniform vec3 uBrass;
uniform vec3 uSplit;        // x at top, x at bottom (px), strip width (px)
varying vec2 vUv;
${common}

void main() {
  vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
  float splitX = mix(uSplit.x, uSplit.y, px.y / uRes.y);
  float sd = px.x - splitX;
  float side = step(0.0, sd);           // 0 plum (Windows, left), 1 petrol (Linux, right)

  // Tiles, offset per carpet so the seams never line up across the strip.
  vec2 tp = px / uTile + side * vec2(0.37, 0.61);
  vec2 tile = floor(tp);
  vec2 f = fract(tp);
  float q = mod(tile.x + tile.y, 2.0);
  float j = (hash(tile + side * 17.0) - 0.5) * 0.45;
  float ang = 0.62 + j + q * 1.5708;
  vec2 nap = vec2(cos(ang), sin(ang));

  vec4 tr = texture2D(tTrail, vUv);
  float crush = max(tr.b, tr.a);
  vec2 cdir = tr.rg * 2.0 - 1.0;
  cdir.y = -cdir.y;
  if (dot(cdir, cdir) > 0.0004) {
    nap = normalize(mix(nap, normalize(cdir), clamp(crush * 1.25, 0.0, 1.0)));
  }

  vec2 L = uLight - px;
  float ld = length(L);
  L /= max(ld, 1.0);
  float facing = dot(nap, L);
  float reach = max(uRes.x, uRes.y);
  float pool = 1.0 - smoothstep(0.0, reach * 0.95, ld);

  // Fibres run along the nap: stretch the noise in the tile's own frame.
  vec2 nf = vec2(dot(px, nap), dot(px, vec2(-nap.y, nap.x)));
  float streak = noise(nf * vec2(0.22, 1.35)) * 0.65 + noise(nf * vec2(0.6, 3.2) + 5.0) * 0.35;
  float grain = noise(px * 1.7 + 11.0);
  float tuft = noise(tp * 10.0 + side * 13.0);
  float heather = noise(px * 0.028 + side * 7.0);

  float amp = mix(1.0, 0.55, uQuiet);
  float pressed = clamp(crush * 1.4, 0.0, 1.0);    // pressed pile loses its texture
  float texAmp = amp * (1.0 - pressed * 0.65);
  float sheen = (0.5 + 0.5 * facing) * (0.4 + 0.6 * pool) * uLightPower;
  float t = 0.2 + sheen * 0.27 * amp + pool * 0.12 * amp
          + (streak - 0.5) * 0.34 * texAmp
          + (grain - 0.5) * 0.12 * texAmp
          + (tuft - 0.5) * 0.1 * texAmp
          + (heather - 0.5) * 0.22 * amp
          // Pressed fibres lie flat and catch the lamp: a print reads as a
          // paler, smoother patch, brightest where the lamp falls.
          + tr.b * 0.46 + tr.a * (0.4 + 0.25 * pool);
  vec3 A = mix(uPlumA, uPetrolA, side);
  vec3 B = mix(uPlumB, uPetrolB, side);
  vec3 col = mix(A, B, clamp(t, 0.0, 1.0));

  // Tile seams.
  float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * uTile;
  col *= mix(0.74, 1.0, smoothstep(0.3, 1.6, edge));

  // The brass threshold strip, brushed lengthwise, with a shadow each side.
  float hw = uSplit.z * 0.5;
  float ad = abs(sd);
  float strip = 1.0 - smoothstep(hw - 0.8, hw + 0.6, ad);
  float brushed = noise(vec2(px.x * 0.6, px.y * 0.02)) * 0.18 + noise(vec2(px.x * 3.0, px.y * 0.08)) * 0.1;
  float ridge = 0.82 + 0.18 * cos(sd / max(hw, 1.0) * 3.1416);
  vec3 brass = uBrass * (ridge + brushed - 0.12) * (0.82 + 0.28 * pool);
  // The worn crown of the strip: brushed brass (#d8b06a) catching the room.
  float crown = 1.0 - smoothstep(0.0, 0.62, abs(sd) / max(hw, 1.0));
  brass = mix(brass, vec3(0.847, 0.69, 0.416) * (0.9 + brushed), crown * 0.75);
  float shade = (1.0 - smoothstep(hw, hw + 5.0, ad)) * (1.0 - strip);
  col *= 1.0 - shade * 0.35;
  col = mix(col, brass, strip);

  // Room falloff toward the corners.
  vec2 uv = vUv - 0.5;
  col *= 1.0 - dot(uv, uv) * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`
