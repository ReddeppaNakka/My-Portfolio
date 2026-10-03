// Night Temple — fully procedural Three.js world.
// Everything (terrain, gates, lanterns, temple, moon, sky, particles) is generated
// in code; there are no external models or textures.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* ------------------------------------------------------------------ */
/* Deterministic helpers                                               */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash2 = (x, y) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
function vnoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 4) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * vnoise(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* The path: a stair climbing from z=30 to z=-138                      */
/* ------------------------------------------------------------------ */
const STEP_D = 0.9;
const STEP_H = 0.13;
const RISE = STEP_H / STEP_D;
const Z_START = 30;
const Z_END = -138;
export const PLAT = (Z_START - Z_END) * RISE; // ≈ 24.3
const pathX = (z) => 2.2 * Math.sin(z * 0.028);
const pathY = (z) => clamp(Z_START - z, 0, Z_START - Z_END) * RISE;
const pathAngle = (z) => Math.atan2(2.2 * 0.028 * Math.cos(z * 0.028), 1);
const P = (z, dx = 0, dy = 0) => new THREE.Vector3(pathX(z) + dx, pathY(z) + dy, z);

const TEMPLE = new THREE.Vector3(0, 0, -168);

function terrainHeight(x, z) {
  const dx = Math.abs(x - pathX(clamp(z, -150, 80)));
  const base = pathY(z) - 0.45;
  const valley = smoothstep(3.2, 34, dx);
  const hills = fbm(x * 0.017 + 3.1, z * 0.017 - 1.7, 5) * 17 * valley + dx * 0.13 * valley;
  let h = base + hills;
  // flatten the temple plaza
  const dT = Math.hypot((x - 2) * 0.8, z - TEMPLE.z);
  const f = 1 - smoothstep(26, 46, dT);
  h = h * (1 - f) + (PLAT - 0.3) * f;
  // mountain wall behind the temple
  h += smoothstep(-195, -300, z) * (12 + fbm(x * 0.01, 4.2, 3) * 38);
  return h;
}

/* ------------------------------------------------------------------ */
/* Canvas textures                                                    */
/* ------------------------------------------------------------------ */
function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Soft cloud puff for low-lying ground mist.
function mistBlobTexture() {
  return canvasTexture(256, 128, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = (x / w) * 2 - 1;
        const v = (y / h) * 2 - 1;
        const fall = clamp(1 - Math.hypot(u, v * 1.15), 0, 1);
        const n = fbm(x * 0.03 + 2.1, y * 0.05, 5);
        const a = clamp((n - 0.28) * 2, 0, 1) * fall * fall;
        const i = (y * w + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = a * 255;
      }
    }
    g.putImageData(img, 0, 0);
  });
}

function mistTexture(seed) {
  return canvasTexture(512, 128, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // tileable-ish horizontally by sampling on a cylinder
        const a = (x / w) * Math.PI * 2;
        const n = fbm(Math.cos(a) * 2.2 + seed, Math.sin(a) * 2.2 + y * 0.03, 5);
        const fall = Math.sin((y / h) * Math.PI);
        const v = clamp((n - 0.35) * 2.2, 0, 1) * fall * fall;
        const i = (y * w + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 255;
        img.data[i + 2] = 255;
        img.data[i + 3] = v * 255;
      }
    }
    g.putImageData(img, 0, 0);
  });
}

function shojiTexture() {
  return canvasTexture(128, 160, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#ffd9a1");
    grd.addColorStop(1, "#f29a52");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(40,18,8,0.85)";
    g.lineWidth = 4;
    for (let x = 0; x <= w; x += w / 4) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += h / 6) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.lineWidth = 10;
    g.strokeRect(0, 0, w, h);
  });
}

/* ------------------------------------------------------------------ */
/* Geometry builders                                                   */
/* ------------------------------------------------------------------ */
function place(geo, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(1, 1, 1)
  );
  geo.applyMatrix4(m);
  return geo;
}
const strip = (geo) => {
  // keep a uniform attribute set so geometries merge cleanly
  const g = geo.index ? geo : geo;
  for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
  return g;
};
const merge = (list) => mergeGeometries(list.map(strip), false);

function toriiGeometries() {
  const red = [];
  const black = [];
  for (const s of [-1, 1]) {
    red.push(place(new THREE.CylinderGeometry(0.22, 0.27, 7.4, 14), s * 2.6, 2.5, 0));
    black.push(place(new THREE.CylinderGeometry(0.33, 0.33, 0.55, 14), s * 2.6, 0.2, 0));
  }
  red.push(place(new THREE.BoxGeometry(6.7, 0.28, 0.22), 0, 4.9, 0));
  red.push(place(new THREE.BoxGeometry(0.26, 0.8, 0.2), 0, 5.45, 0));
  red.push(place(new THREE.BoxGeometry(7.3, 0.34, 0.36), 0, 5.98, 0));
  const kasagi = new THREE.BoxGeometry(8.6, 0.36, 0.5, 32, 1, 1);
  const pos = kasagi.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / 4.3;
    pos.setY(i, pos.getY(i) + x * x * x * x * 0.42 + x * x * 0.12);
  }
  kasagi.computeVertexNormals();
  black.push(place(kasagi, 0, 6.36, 0));
  return { red: merge(red), black: merge(black) };
}

function lanternGeometries() {
  const stone = merge([
    place(new THREE.CylinderGeometry(0.42, 0.55, 0.26, 6), 0, 0.13, 0),
    place(new THREE.CylinderGeometry(0.13, 0.18, 1.0, 8), 0, 0.75, 0),
    place(new THREE.CylinderGeometry(0.44, 0.34, 0.18, 6), 0, 1.33, 0),
    // fire-box frame posts
    ...[
      [-0.19, -0.19],
      [0.19, -0.19],
      [-0.19, 0.19],
      [0.19, 0.19],
    ].map(([x, z]) => place(new THREE.BoxGeometry(0.07, 0.42, 0.07), x, 1.63, z)),
    place(new THREE.ConeGeometry(0.66, 0.42, 6), 0, 2.05, 0),
    place(new THREE.SphereGeometry(0.11, 8, 6), 0, 2.33, 0),
  ]);
  const fire = place(new THREE.BoxGeometry(0.34, 0.36, 0.34), 0, 1.63, 0);
  return { stone, fire };
}

// One drooping layer of needles/leaves: a shallow cone whose rim is serrated
// into spiky bough tips that hang lower than the gaps between them. Stacked,
// these read as a real conifer silhouette instead of a smooth cartoon cone.
function boughTier(r, h, seed, spikes = 26) {
  const rr = mulberry32(seed);
  const N = spikes;
  const verts = [0, h, 0];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (rr() - 0.5) * 0.1;
    const tip = i % 2 === 0;
    const rad = r * (tip ? 0.9 + rr() * 0.28 : 0.55 + rr() * 0.12);
    const droop = tip ? -h * (0.3 + rr() * 0.18) : -h * 0.06;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    verts.push(c * rad * 0.5, h * (0.42 + rr() * 0.06), sn * rad * 0.5); // bough shoulder
    verts.push(c * rad, droop, sn * rad); // drooping tip / notch
  }
  const under = verts.length / 3;
  verts.push(0, h * 0.12, 0);
  const idx = [];
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    const mi = 1 + i * 2;
    const ri = 2 + i * 2;
    const mj = 1 + j * 2;
    const rj = 2 + j * 2;
    idx.push(0, mj, mi, mi, mj, ri, mj, rj, ri, under, ri, rj);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A tapered branch from a to b.
function limb(a, b, r0, r1) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, 6, 1);
  g.deleteAttribute("uv");
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(a.clone().lerp(b, 0.5), q, new THREE.Vector3(1, 1, 1)));
  return g;
}

// Japanese cedar (sugi): straight trunk, many narrow drooping tiers.
function cedarGeometry() {
  const rr = mulberry32(5);
  const parts = [limb(new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 11.5, 0), 0.26, 0.05)];
  const tiers = 10;
  for (let i = 0; i < tiers; i++) {
    const k = i / (tiers - 1);
    const r = 2.0 * Math.pow(1 - k, 0.9) + 0.28;
    const h = 1.25 + (1 - k) * 0.8;
    const y = 2.6 + k * 8.6;
    const g = boughTier(r, h, 11 + i * 7);
    g.rotateY(i * 0.9);
    g.translate((rr() - 0.5) * 0.12, y, (rr() - 0.5) * 0.12);
    parts.push(g);
  }
  return mergeGeometries(parts, false);
}

// Japanese maple: forked trunk, branches reaching out to wide layered leaf pads.
function mapleGeometry() {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const fork = V(0.1, 2.2, 0);
  const parts = [limb(V(0, -0.3, 0), fork, 0.26, 0.16)];
  const pads = [
    [0.2, 4.7, -0.1, 2.1, 0.9],
    [1.9, 3.7, 0.7, 1.6, 0.75],
    [-1.8, 3.5, -0.5, 1.7, 0.75],
    [-0.5, 3.3, 1.8, 1.4, 0.7],
    [0.8, 3.9, -1.8, 1.4, 0.7],
    [-0.3, 5.7, 0.4, 1.3, 0.75],
  ];
  pads.forEach(([x, y, z, r, h], i) => {
    const end = V(x * 0.8, y - 0.35, z * 0.8);
    parts.push(limb(fork, end, 0.13, 0.04));
    const g = boughTier(r, h, 70 + i * 13, 22);
    g.rotateY(i * 1.3);
    g.translate(x, y - h * 0.3, z);
    parts.push(g);
  });
  return mergeGeometries(parts, false);
}

// Curved hip roof with upturned corners. W/D = half extents at the eave.
function roofGeometry(W, D, H, lift, rW, rD) {
  const N = 14; // samples per side
  const U = 10; // rings
  const ring = [];
  const sides = [
    [-1, 1, 1, 1],
    [1, 1, 1, -1],
    [1, -1, -1, -1],
    [-1, -1, -1, 1],
  ];
  for (const [ax, az, bx, bz] of sides) {
    for (let i = 0; i < N; i++) {
      const t = i / N;
      ring.push([ax + (bx - ax) * t, az + (bz - az) * t]);
    }
  }
  const verts = [];
  const RN = ring.length;
  for (let u = 0; u <= U; u++) {
    const k = u / U;
    const hw = W + (rW - W) * k;
    const hd = D + (rD - D) * k;
    const y = H * (0.18 * k + 0.82 * k * k);
    for (const [px, pz] of ring) {
      const corner = Math.pow(Math.abs(px * pz), 6);
      const yy = y + lift * corner * Math.pow(1 - k, 2.2);
      verts.push(px * hw, yy, pz * hd);
    }
  }
  const idx = [];
  for (let u = 0; u < U; u++) {
    for (let i = 0; i < RN; i++) {
      const a = u * RN + i;
      const b = u * RN + ((i + 1) % RN);
      const c = (u + 1) * RN + i;
      const d = (u + 1) * RN + ((i + 1) % RN);
      idx.push(a, c, b, b, c, d);
    }
  }
  // cap
  const capStart = verts.length / 3;
  verts.push(0, H, 0);
  for (let i = 0; i < RN; i++) idx.push(U * RN + i, capStart, U * RN + ((i + 1) % RN));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* Scene factory                                                       */
/* ------------------------------------------------------------------ */
export function createTempleScene(canvas, { mobile = false, reducedMotion = false, figureUrl, onFirstFrame, onTooSlow } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile,
    powerPreference: "high-performance",
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x06080c, 1);

  const scene = new THREE.Scene();
  const FOG = new THREE.Color(0x111824);
  scene.fog = new THREE.FogExp2(FOG, mobile ? 0.0095 : 0.0085);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2400);
  const textures = [];
  const T = (t) => (textures.push(t), t);
  const rnd = mulberry32(1337);

  /* ---------- atmosphere ----------
     One aerial-perspective model shared by sky, mountains and every lit
     material: cool indigo haze that warms toward the blood moon, thicker in
     the valleys. This is what gives the painted, layered anime depth. */
  const MOON_POS = new THREE.Vector3(116, 300, -760);
  const moonDir = MOON_POS.clone().normalize();
  const atmo = {
    uMoonDirW: { value: moonDir },
    uFogCool: { value: new THREE.Color(0x0f1626) },
    uFogWarm: { value: new THREE.Color(0x48181c) },
    uFogDensity: { value: mobile ? 0.0095 : 0.0085 },
    uTime: { value: 0 },
  };
  const ATMO_GLSL = /* glsl */ `
    uniform vec3 uMoonDirW; uniform vec3 uFogCool; uniform vec3 uFogWarm; uniform float uFogDensity;
    vec3 hazeColor(vec3 dir){
      float m = max(dot(dir, uMoonDirW), 0.0);
      return mix(uFogCool, uFogWarm, pow(m, 9.0)) + vec3(0.16, 0.03, 0.015) * pow(m, 40.0);
    }
    float hazeAmount(vec3 wpos){
      float dist = length(wpos - cameraPosition);
      float f = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
      float low = exp(-max(wpos.y - cameraPosition.y + 6.0, 0.0) * 0.06);
      return clamp(f * mix(0.7, 1.15, low), 0.0, 0.92);
    }`;

  // Patch built-in materials: atmospheric haze for all, moon rim light for lit ones.
  const stylized = new Set();
  function stylize(mat) {
    if (stylized.has(mat) || !mat.fog) return;
    stylized.add(mat);
    const rim = mat.userData.rim ?? 0;
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, atmo);
      sh.uniforms.uRim = { value: rim };
      sh.uniforms.uRimColor = { value: new THREE.Color(0xff6b4a) };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWPos;").replace(
        "#include <fog_vertex>",
        `#include <fog_vertex>
        vec4 wp_ = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp_ = instanceMatrix * wp_;
        #endif
        vWPos = (modelMatrix * wp_).xyz;`
      );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>\nvarying vec3 vWPos; uniform float uRim; uniform vec3 uRimColor;\n${ATMO_GLSL}`)
        .replace(
          "#include <fog_fragment>",
          `gl_FragColor.rgb = mix(gl_FragColor.rgb, hazeColor(normalize(vWPos - cameraPosition)), hazeAmount(vWPos));`
        );
      if (sh.fragmentShader.includes("varying vec3 vViewPosition")) {
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <opaque_fragment>",
          `{
            vec3 vMoon = normalize((viewMatrix * vec4(uMoonDirW, 0.0)).xyz);
            float fres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.5);
            float face = smoothstep(-0.25, 0.6, dot(normal, vMoon));
            outgoingLight += uRimColor * fres * face * uRim;
          }
          #include <opaque_fragment>`
        );
      }
    };
  }

  /* ---------- sky: painted gradient, moon, moonlit clouds, stars, milky way ---------- */
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { ...atmo },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      ${ATMO_GLSL}
      varying vec3 vDir;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      float n2(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      float fbm(vec2 p){ float s = 0.0; float a = 0.5; for (int i = 0; i < 6; i++){ s += a * n2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
      float cloudField(vec2 uv, float t){
        uv *= vec2(0.32, 0.9);
        vec2 w = vec2(fbm(uv * 0.8 + vec2(t * 0.004, 0.0)), fbm(uv * 0.8 + vec2(5.2, 1.3)));
        float a = fbm(uv + w * 1.2 + vec2(t * 0.008, 0.0));
        float b = fbm(uv * 2.6 + w * 0.6 - vec2(t * 0.005, 0.0));
        return a * 0.8 + b * 0.3;
      }
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        float md = dot(d, uMoonDirW);
        float mp = max(md, 0.0);

        // painted gradient: haze at the horizon → violet band → near-black indigo zenith
        vec3 c = hazeColor(d);
        c = mix(c, vec3(0.030, 0.026, 0.070), smoothstep(0.0, 0.2, h));
        c = mix(c, vec3(0.004, 0.006, 0.018), smoothstep(0.2, 0.85, h));
        c += vec3(0.50, 0.08, 0.04) * (pow(mp, 14.0) * 0.22 + pow(mp, 90.0) * 0.5);

        // milky way
        vec3 nb = normalize(vec3(0.55, 0.32, 0.78));
        float band = exp(-pow(dot(d, nb) / 0.16, 2.0)) * smoothstep(0.02, 0.25, h);
        vec2 bp = vec2(atan(d.z, d.x), d.y) * 5.0;
        float dust = fbm(bp * 1.4);
        c += vec3(0.055, 0.045, 0.10) * band * smoothstep(0.35, 0.8, dust) * 1.6;
        c -= vec3(0.02) * band * smoothstep(0.55, 0.75, fbm(bp * 3.0 + 4.0));

        // stars (denser in the band, hidden near horizon and moon)
        vec3 sp = d * 260.0;
        vec3 cell = floor(sp);
        float r = h31(cell);
        float thr = 0.982 - band * 0.03;
        float star = 0.0;
        if (r > thr) {
          vec3 off = vec3(h31(cell + 1.3), h31(cell + 2.7), h31(cell + 5.1)) - 0.5;
          float dd = length(fract(sp) - 0.5 - off * 0.6);
          float tw = 0.55 + 0.45 * sin(uTime * (0.8 + r * 3.0) + r * 120.0);
          star = smoothstep(0.22, 0.0, dd) * tw * (0.35 + (r - thr) / (1.0 - thr));
        }
        star *= smoothstep(0.03, 0.2, h) * (1.0 - smoothstep(0.9, 0.995, md));
        vec3 starCol = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.85, 0.7), h31(cell + 9.0));
        c += starCol * star * 1.4;

        // the moon: limb-darkened disc with maria, painted under the clouds
        float R = 0.085;
        float ang = acos(clamp(md, -1.0, 1.0));
        vec3 t1 = normalize(cross(uMoonDirW, vec3(0.0, 1.0, 0.0)));
        vec3 t2 = cross(t1, uMoonDirW);
        vec2 lp = vec2(dot(d, t1), dot(d, t2)) / R;
        float disk = smoothstep(R, R * 0.985, ang);
        float limb = sqrt(max(1.0 - dot(lp, lp), 0.0));
        float maria = smoothstep(0.42, 0.72, fbm(lp * 1.6 + 3.0));
        float craters = fbm(lp * 7.0 + 11.0);
        vec3 moonCol = mix(vec3(1.55, 0.36, 0.13), vec3(0.78, 0.13, 0.05), maria * 0.85);
        moonCol *= (0.45 + 0.55 * limb) * (0.82 + craters * 0.35);
        c = mix(c, moonCol, disk);
        c += vec3(0.9, 0.16, 0.06) * exp(-max(ang - R, 0.0) * 30.0) * 0.26 * (1.0 - disk);

        // moonlit clouds with silver linings
        if (h > -0.04) {
          vec2 cuv = d.xz / (h + 0.14) * 0.85;
          vec2 muv = uMoonDirW.xz / (uMoonDirW.y + 0.14) * 0.85;
          float cf = cloudField(cuv, uTime);
          float dens = smoothstep(0.46, 0.84, cf);
          dens *= smoothstep(-0.03, 0.10, h) * (1.0 - 0.85 * smoothstep(0.32, 0.75, h));
          vec2 toM = normalize(muv - cuv + 1e-4) * 0.12;
          float cf2 = cloudField(cuv + toM, uTime);
          float lit = clamp((cf - cf2) * 7.0, 0.0, 1.0);
          float edge = clamp(1.0 - abs(cf - 0.6) * 7.0, 0.0, 1.0);
          float near = pow(mp, 3.0);
          vec3 litCol = mix(vec3(0.07, 0.06, 0.14), vec3(1.3, 0.26, 0.10), pow(mp, 6.0));
          vec3 cc = mix(c, hazeColor(d), 0.55) * 0.7 + vec3(0.006, 0.007, 0.018);
          cc += litCol * (lit * 0.9 + edge * 0.3) * (0.18 + near * 1.3);
          cc += vec3(1.4, 0.35, 0.12) * pow(mp, 300.0) * 1.2; // backlit where they cross the moon
          c = mix(c, cc, dens * 0.88);
        }

        c += (h21(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0; // dither away banding
        gl_FragColor = vec4(max(c, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), skyMat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  /* ---------- far mountains (layered, hazed at the base, rim-lit tree lines) ---------- */
  const ridgeTop = [0x070a12, 0x0c111c, 0x131a28, 0x1b2233];
  const ridgeZ = [-330, -430, -540, -660];
  ridgeTop.forEach((col, li) => {
    const shape = new THREE.Shape();
    const W = 1500;
    const step = li < 2 ? 3 : 8;
    let maxPeak = 0;
    shape.moveTo(-W, -80);
    for (let x = -W; x <= W; x += step) {
      const n = fbm(x * 0.0042 + li * 9.3, li * 3.7, 5);
      let peak = Math.pow(n, 1.7) * (70 + li * 34) + 8 + li * 14;
      if (li < 2) {
        // cedar tree-line serration along the nearer ridges
        const s = Math.abs((((x + W) * 0.16 + fbm(x * 0.05, li, 2) * 3) % 1) * 2 - 1);
        peak += (1 - s) * (2.4 - li) * 1.6 + fbm(x * 0.03, li + 2, 2) * 3;
      }
      maxPeak = Math.max(maxPeak, peak);
      shape.lineTo(x, peak);
    }
    shape.lineTo(W, -80);
    const mat = new THREE.ShaderMaterial({
      fog: false,
      uniforms: {
        ...atmo,
        uTop: { value: new THREE.Color(col) },
        uPeak: { value: maxPeak },
        uHaze: { value: 0.12 + li * 0.16 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vW; varying float vY;
        void main(){
          vY = position.y;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform float uPeak; uniform float uHaze;
        ${ATMO_GLSL}
        varying vec3 vW; varying float vY;
        void main(){
          vec3 dir = normalize(vW - cameraPosition);
          float k = smoothstep(uPeak * 0.7, -30.0, vY);
          vec3 col = mix(uTop, hazeColor(dir), clamp(uHaze + k * 0.75, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
    m.position.set(0, -10, ridgeZ[li]);
    scene.add(m);
  });

  /* ---------- mist bands ---------- */
  const mists = [];
  [
    { y: 70, z: -460, w: 1600, h: 90, o: 0.13, s: 0.004, seed: 1 },
    { y: 205, z: -720, w: 1600, h: 60, o: 0.26, s: 0.006, seed: 4, warm: true },
    { y: 42, z: -300, w: 900, h: 60, o: 0.12, s: -0.005, seed: 7 },
    { y: PLAT + 4, z: -215, w: 500, h: 26, o: 0.14, s: 0.008, seed: 11 },
  ].forEach((c) => {
    const tex = T(mistTexture(c.seed));
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(c.w, c.h),
      new THREE.MeshBasicMaterial({
        map: tex,
        color: c.warm ? 0x8a5a4c : 0x7f8ea6,
        transparent: true,
        opacity: c.o,
        depthWrite: false,
        fog: false,
      })
    );
    m.position.set(0, c.y, c.z);
    scene.add(m);
    mists.push({ tex, s: c.s });
  });

  /* ---------- terrain ---------- */
  {
    const seg = mobile ? 110 : 190;
    const geo = new THREE.PlaneGeometry(640, 560, seg, seg);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -110);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cA = new THREE.Color(0x0f1419);
    const cB = new THREE.Color(0x1b2229);
    const cMoss = new THREE.Color(0x141c17);
    const cLitter = new THREE.Color(0x3b120b);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, terrainHeight(x, z));
      const n = fbm(x * 0.08, z * 0.08, 3);
      tmp.copy(cA).lerp(cB, n).lerp(cMoss, fbm(x * 0.02 + 5, z * 0.02, 2) * 0.8);
      // fallen maple leaves drifted against the path edges
      const dxp = Math.abs(x - pathX(clamp(z, -150, 80)));
      tmp.lerp(cLitter, smoothstep(11, 4.5, dxp) * smoothstep(0.4, 0.68, fbm(x * 0.35 + 9, z * 0.35, 3)) * 0.9);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    terrainMat.userData.rim = 0.12;
    const terrain = new THREE.Mesh(geo, terrainMat);
    scene.add(terrain);
  }

  /* ---------- stairs + approach flagstones ---------- */
  {
    // damp stone: low-ish roughness so lanterns and the moon leave a sheen on the steps
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4d5155, roughness: 0.42, metalness: 0.18 });
    stoneMat.userData.rim = 0.2;
    const geo = new THREE.BoxGeometry(4.7, 1.2, STEP_D * 1.02);
    const count = Math.round((Z_START - Z_END) / STEP_D) + 1 + 24;
    const mesh = new THREE.InstancedMesh(geo, stoneMat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const col = new THREE.Color();
    let i = 0;
    for (let k = 0; k * STEP_D <= Z_START - Z_END; k++) {
      const z = Z_START - k * STEP_D - STEP_D / 2;
      const top = (k + 1) * STEP_H;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), pathAngle(z));
      m.compose(new THREE.Vector3(pathX(z), top - 0.6, z), q, s);
      mesh.setMatrixAt(i, m);
      const moss = rnd() * 0.18;
      col.setRGB(0.72 + rnd() * 0.3 - moss, 0.74 + rnd() * 0.3, 0.78 + rnd() * 0.3 - moss);
      mesh.setColorAt(i, col);
      i++;
    }
    // flat approach (z 30..60)
    for (let k = 0; k < 24 && i < count; k++) {
      const z = Z_START + 0.65 + k * 1.3;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rnd() - 0.5) * 0.05);
      m.compose(new THREE.Vector3(pathX(z) + (rnd() - 0.5) * 0.2, 0.05 - 0.6, z), q, new THREE.Vector3(0.95, 1, 1.35));
      mesh.setMatrixAt(i, m);
      col.setRGB(0.7 + rnd() * 0.3, 0.7 + rnd() * 0.3, 0.75 + rnd() * 0.3);
      mesh.setColorAt(i, col);
      i++;
    }
    mesh.count = i;
    scene.add(mesh);
  }

  /* ---------- torii gates ---------- */
  const lightSources = []; // { pos: Vector3, base: number, seed: number }
  const chochin = []; // hanging lantern matrices
  {
    const { red, black } = toriiGeometries();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc4301b, roughness: 0.5, emissive: 0x2a0602, emissiveIntensity: 1 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.55 });
    redMat.userData.rim = 0.55;
    blackMat.userData.rim = 0.3;
    const gates = [];
    gates.push({ z: 36, s: 1.55 });
    for (let z = -8; z >= -62; z -= 2.35) gates.push({ z, s: 1 });
    gates.push({ z: -86, s: 1.12 }, { z: -106, s: 1.12 }, { z: -131, s: 1.38 });
    const rm = new THREE.InstancedMesh(red, redMat, gates.length);
    const bm = new THREE.InstancedMesh(black, blackMat, gates.length);
    const m = new THREE.Matrix4();
    gates.forEach((g, i) => {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pathAngle(g.z));
      m.compose(new THREE.Vector3(pathX(g.z), g.z > Z_START ? 0 : pathY(g.z), g.z), q, new THREE.Vector3(g.s, g.s, g.s));
      rm.setMatrixAt(i, m);
      bm.setMatrixAt(i, m);
      const inTunnel = g.z < -5 && g.z > -64;
      if ((inTunnel && i % 3 === 0) || g.s > 1.1) {
        // hang a paper lantern from the nuki
        const p = new THREE.Vector3(0, 4.25, 0).multiplyScalar(g.s).applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(pathX(g.z), g.z > Z_START ? 0 : pathY(g.z), g.z), q, new THREE.Vector3(1, 1, 1)));
        chochin.push({ p, s: g.s });
        lightSources.push({ pos: p.clone(), base: 10, seed: rnd() * 100 });
      }
    });
    scene.add(rm, bm);
  }

  /* ---------- stone lanterns ---------- */
  const lanternFlicker = [];
  {
    const { stone, fire } = lanternGeometries();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b6d6f, roughness: 0.8 });
    stoneMat.userData.rim = 0.3;
    const fireMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.35, 0.55), toneMapped: false });
    const spots = [];
    for (let z = 58; z >= -134; z -= 7.6) {
      for (const side of [-1, 1]) spots.push({ z: z + (side > 0 ? 3.8 : 0), side });
    }
    const sm = new THREE.InstancedMesh(stone, stoneMat, spots.length);
    const fm = new THREE.InstancedMesh(fire, fireMat, spots.length);
    const m = new THREE.Matrix4();
    spots.forEach((s, i) => {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), pathAngle(s.z));
      const off = new THREE.Vector3(s.side * 3.75, 0, 0).applyQuaternion(q);
      const base = new THREE.Vector3(pathX(s.z) + off.x, pathY(s.z) + 0.02, s.z + off.z);
      m.compose(base, q, new THREE.Vector3(1, 1, 1));
      sm.setMatrixAt(i, m);
      fm.setMatrixAt(i, m);
      lightSources.push({ pos: base.clone().add(new THREE.Vector3(0, 1.75, 0)), base: 7, seed: rnd() * 100 });
    });
    scene.add(sm, fm);
    lanternFlicker.push(fireMat);
  }

  /* ---------- temple compound ---------- */
  const woodRed = new THREE.MeshStandardMaterial({ color: 0xb02c19, roughness: 0.65, emissive: 0x220502 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x24140f, roughness: 0.9 });
  // glazed tile roofs catch a moonlit sheen along their curves
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1d2531, roughness: 0.42, metalness: 0.35, side: THREE.DoubleSide });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4e5257, roughness: 0.85 });
  woodRed.userData.rim = 0.5;
  woodDark.userData.rim = 0.25;
  roofMat.userData.rim = 0.6;
  stoneMat.userData.rim = 0.2;
  const shojiTex = T(shojiTexture());
  const shojiMat = new THREE.MeshBasicMaterial({ map: shojiTex, color: new THREE.Color(1.5, 1.15, 0.85), toneMapped: false });

  function buildHall() {
    const g = new THREE.Group();
    const add = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    add(new THREE.BoxGeometry(24, 1.4, 16), stoneMat, 0, 0.7, 0);
    add(new THREE.BoxGeometry(8, 0.7, 3), stoneMat, 0, 0.35, 9.2);
    add(new THREE.BoxGeometry(19, 5.8, 12), woodDark, 0, 1.4 + 2.9, -0.5);
    for (let i = 0; i < 5; i++) {
      const panel = add(new THREE.PlaneGeometry(3.1, 3.9), shojiMat, -7.2 + i * 3.6, 1.4 + 2.5, 5.52);
      panel.userData.light = true;
    }
    const pillarGeo = new THREE.CylinderGeometry(0.32, 0.36, 6.2, 12);
    for (let i = 0; i < 7; i++) add(pillarGeo, woodRed, -10.5 + i * 3.5, 1.4 + 3.1, 7.2);
    for (const x of [-10.5, 10.5]) for (const z of [3, -1.5, -6]) add(pillarGeo, woodRed, x, 1.4 + 3.1, z);
    add(new THREE.BoxGeometry(23, 0.55, 0.55), woodRed, 0, 7.5, 7.2);
    add(new THREE.BoxGeometry(23, 0.4, 0.4), woodRed, 0, 6.6, 7.2);
    const r1 = add(roofGeometry(14.6, 10.6, 4.2, 1.4, 8, 3), roofMat, 0, 7.75, 0);
    r1.castShadow = false;
    add(new THREE.BoxGeometry(13, 2.6, 7), woodDark, 0, 7.75 + 4.2 + 0.4, 0);
    add(new THREE.BoxGeometry(13.2, 0.4, 7.2), woodRed, 0, 7.75 + 4.2 + 1.6, 0);
    add(roofGeometry(10.2, 6.6, 3.9, 1.1, 5.6, 0.45), roofMat, 0, 13.6, 0);
    add(new THREE.BoxGeometry(11.6, 0.6, 0.8), woodDark, 0, 13.6 + 3.9 + 0.2, 0);
    for (const s of [-1, 1]) {
      const fin = add(new THREE.BoxGeometry(0.5, 1.4, 0.5), woodDark, s * 5.8, 13.6 + 3.9 + 0.7, 0);
      fin.rotation.z = s * -0.35;
    }
    return g;
  }
  const hall = buildHall();
  hall.position.set(TEMPLE.x, PLAT, TEMPLE.z);
  scene.add(hall);
  const hall2 = buildHall();
  hall2.scale.setScalar(0.55);
  hall2.position.set(-27, PLAT, -184);
  hall2.rotation.y = 0.55;
  scene.add(hall2);

  // plaza
  {
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 58), stoneMat);
    plaza.position.set(2, PLAT - 0.45, -166);
    scene.add(plaza);
  }

  // a lone figure standing on the first torii, silhouetted against the blood
  // moon in the opening shot — met in full at the summit (HTML layer)
  let figure = null;
  let disposed = false;
  if (figureUrl) {
    new THREE.TextureLoader().load(figureUrl, (tex) => {
      if (disposed) return tex.dispose();
      tex.colorSpace = THREE.SRGBColorSpace;
      textures.push(tex);
      figure = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, fog: false, depthWrite: false, alphaTest: 0.02 }));
      figure.center.set(0.5, 0);
      const h = 3.3;
      figure.scale.set((h * tex.image.width) / tex.image.height, h, 1);
      // right end of the gate's top beam (gate at z=36, scale 1.55)
      const a = pathAngle(36);
      figure.position.set(pathX(36) + Math.cos(a) * 4.1, 10.25, 36 - Math.sin(a) * 4.1);
      scene.add(figure);
    });
  }

  // five-storey pagoda
  {
    const g = new THREE.Group();
    let y = 0;
    const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 8), stoneMat);
    base.position.y = 0.6;
    g.add(base);
    y = 1.2;
    for (let i = 0; i < 5; i++) {
      const b = 5.2 - i * 0.62;
      const body = new THREE.Mesh(new THREE.BoxGeometry(b, 2.4, b), i % 2 ? woodRed : woodRed);
      body.position.y = y + 1.2;
      g.add(body);
      const win = new THREE.Mesh(new THREE.PlaneGeometry(b * 0.45, 1.3), shojiMat);
      win.position.set(0, y + 1.1, b / 2 + 0.02);
      g.add(win);
      const roof = new THREE.Mesh(roofGeometry(b / 2 + 2.1, b / 2 + 2.1, 1.5, 0.8, b * 0.28, b * 0.28), roofMat);
      roof.position.y = y + 2.3;
      g.add(roof);
      y += 3.1;
    }
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 7, 8), woodDark);
    spire.position.y = y + 3;
    g.add(spire);
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42 - i * 0.02, 0.07, 6, 16), woodDark);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y + 0.9 + i * 0.5;
      g.add(ring);
    }
    g.position.set(23, PLAT, -188);
    g.rotation.y = -0.25;
    scene.add(g);
  }

  // hanging paper lanterns (chochin) — on gates + along the hall eave
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Vector3(TEMPLE.x - 8.75 + i * 3.5, PLAT + 5.8, TEMPLE.z + 7.2);
    chochin.push({ p, s: 1.1 });
    if (i % 2 === 0) lightSources.push({ pos: p.clone(), base: 12, seed: rnd() * 100 });
  }
  {
    const geo = new THREE.SphereGeometry(0.34, 16, 12);
    geo.scale(1, 1.3, 1);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.8, 0.32), toneMapped: false });
    const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12);
    const capMat = new THREE.MeshBasicMaterial({ color: 0x0a0807 });
    const lm = new THREE.InstancedMesh(geo, mat, chochin.length);
    const cm = new THREE.InstancedMesh(capGeo, capMat, chochin.length * 2);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    chochin.forEach((c, i) => {
      const s = new THREE.Vector3(c.s, c.s, c.s);
      m.compose(c.p, q, s);
      lm.setMatrixAt(i, m);
      m.compose(c.p.clone().add(new THREE.Vector3(0, 0.46 * c.s, 0)), q, s);
      cm.setMatrixAt(i * 2, m);
      m.compose(c.p.clone().add(new THREE.Vector3(0, -0.46 * c.s, 0)), q, s);
      cm.setMatrixAt(i * 2 + 1, m);
    });
    scene.add(lm, cm);
  }

  /* ---------- cedars ---------- */
  {
    const n = mobile ? 240 : 560;
    const geo = cedarGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a1214, roughness: 0.95 });
    mat.userData.rim = 0.32;
    const mesh = new THREE.InstancedMesh(geo, mat, n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    let placed = 0;
    let guard = 0;
    while (placed < n && guard++ < n * 20) {
      const z = 70 - rnd() * 330;
      const x = (rnd() - 0.5) * 240;
      const dx = Math.abs(x - pathX(clamp(z, -150, 80)));
      if (dx < 7.5) continue;
      if (Math.hypot(x - 2, z - TEMPLE.z) < 40 && z > -205) continue;
      if (z > 20 && dx < 22) continue; // keep the hero shot open
      const y = terrainHeight(x, z) - 0.3;
      const sc = 0.9 + rnd() * 1.4 + smoothstep(8, 40, dx) * 0.6;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI);
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sc, sc * (0.9 + rnd() * 0.5), sc));
      mesh.setMatrixAt(placed, m);
      const v = 0.7 + rnd() * 0.5;
      col.setRGB(v * (0.85 + rnd() * 0.2), v, v * (0.95 + rnd() * 0.25));
      mesh.setColorAt(placed, col);
      placed++;
    }
    mesh.count = placed;
    scene.add(mesh);
  }

  /* ---------- red maples framing the climb ---------- */
  {
    const n = mobile ? 46 : 110;
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, emissive: 0x1a0302 });
    mat.userData.rim = 0.55;
    const mesh = new THREE.InstancedMesh(mapleGeometry(), mat, n);
    const palette = [0x8e1a12, 0xa52116, 0x701109, 0xbf3a1c, 0x7d1610];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let placed = 0;
    let guard = 0;
    while (placed < n - 10 && guard++ < n * 40) {
      const shrub = placed % 3 === 0;
      const z = 58 - rnd() * 205;
      const side = rnd() < 0.5 ? -1 : 1;
      const dx = shrub ? 4.9 + rnd() * 2.2 : 6.5 + rnd() * 12;
      const x = pathX(clamp(z, -150, 80)) + side * dx;
      if (Math.hypot(x - 2, z - TEMPLE.z) < 30 && z > -205) continue;
      if (z > 34 && dx < 9) continue; // keep the hero framing open
      const sc = shrub ? 0.32 + rnd() * 0.2 : 0.75 + rnd() * 0.6;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI * 2);
      m.compose(new THREE.Vector3(x, terrainHeight(x, z) - (shrub ? 0.5 : 0.25), z), q, new THREE.Vector3(sc, sc * (0.85 + rnd() * 0.3), sc));
      mesh.setMatrixAt(placed, m);
      mesh.setColorAt(placed, new THREE.Color(palette[Math.floor(rnd() * palette.length)]));
      placed++;
    }
    // a ring around the temple plaza
    for (let i = 0; i < 10 && placed < n; i++) {
      const a = -0.4 + (i / 9) * 3.9 + rnd() * 0.2;
      const x = 2 + Math.cos(a) * 34;
      const z = TEMPLE.z + Math.sin(a) * 24;
      const sc = 0.9 + rnd() * 0.5;
      m.compose(new THREE.Vector3(x, PLAT - 0.3, z), q, new THREE.Vector3(sc, sc, sc));
      mesh.setMatrixAt(placed, m);
      mesh.setColorAt(placed, new THREE.Color(palette[i % palette.length]));
      placed++;
    }
    mesh.count = placed;
    scene.add(mesh);
  }

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0x2a3758, 0x06070a, 0.65));
  const moonLight = new THREE.DirectionalLight(0xff9a7a, 0.55);
  moonLight.position.copy(moonDir).multiplyScalar(100);
  scene.add(moonLight);
  const fill = new THREE.DirectionalLight(0x6f86b3, 0.35);
  fill.position.set(-80, 60, 90);
  scene.add(fill);
  const hallLight = new THREE.PointLight(0xffa15c, 90, 40, 1.6);
  hallLight.position.set(TEMPLE.x, PLAT + 4, TEMPLE.z + 12);
  scene.add(hallLight);
  const POOL = mobile ? 4 : 8;
  const pool = [];
  for (let i = 0; i < POOL; i++) {
    const l = new THREE.PointLight(0xffa04e, 0, 16, 1.8);
    scene.add(l);
    pool.push(l);
  }

  /* ---------- lantern halos: soft billboards that bloom like painted light ---------- */
  const glowMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: atmo.uTime, uMotion: { value: reducedMotion ? 0 : 1 }, uFogDensity: atmo.uFogDensity },
    vertexShader: /* glsl */ `
      attribute vec3 aCenter; attribute float aSize; attribute float aSeed; attribute vec3 aColor;
      uniform float uTime; uniform float uMotion; uniform float uFogDensity;
      varying vec2 vUv; varying float vA; varying vec3 vCol;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
        float t = uTime * uMotion;
        float fl = 0.88 + 0.12 * sin(t * (5.0 + aSeed * 4.0) + aSeed * 40.0) * sin(t * 2.3 + aSeed * 13.0);
        mv.xy += position.xy * aSize * fl;
        gl_Position = projectionMatrix * mv;
        float dist = -mv.z;
        vA = smoothstep(0.6, 4.0, dist) * exp(-uFogDensity * uFogDensity * dist * dist * 0.5) * fl;
        vCol = aColor;
      }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; varying float vA; varying vec3 vCol;
      void main(){
        float d = length(vUv - 0.5) * 2.0;
        float a = (exp(-d * d * 14.0) * 0.8 + exp(-d * d * 3.2) * 0.32) * (1.0 - smoothstep(0.75, 1.0, d)) * vA;
        gl_FragColor = vec4(vCol * a, 1.0);
      }`,
  });
  {
    const glows = lightSources.map((l) => ({
      p: l.pos,
      size: l.base >= 10 ? 3.6 : 2.4,
      col: l.base >= 10 ? [0.95, 0.3, 0.1] : [0.85, 0.4, 0.14],
      seed: l.seed,
    }));
    for (let i = 0; i < 5; i++) {
      glows.push({ p: new THREE.Vector3(TEMPLE.x - 7.2 + i * 3.6, PLAT + 3.9, TEMPLE.z + 6.2), size: 7, col: [0.45, 0.22, 0.08], seed: i * 3.1 });
    }
    const n = glows.length;
    const centers = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const seeds = new Float32Array(n);
    const cols = new Float32Array(n * 3);
    glows.forEach((g, i) => {
      centers.set([g.p.x, g.p.y, g.p.z], i * 3);
      sizes[i] = g.size;
      seeds[i] = (g.seed % 1) + 0.001 * i;
      cols.set(g.col, i * 3);
    });
    const quad = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = quad.index;
    geo.setAttribute("position", quad.attributes.position);
    geo.setAttribute("uv", quad.attributes.uv);
    geo.setAttribute("aCenter", new THREE.InstancedBufferAttribute(centers, 3));
    geo.setAttribute("aSize", new THREE.InstancedBufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    geo.setAttribute("aColor", new THREE.InstancedBufferAttribute(cols, 3));
    geo.instanceCount = n;
    const glowMesh = new THREE.Mesh(geo, glowMat);
    glowMesh.frustumCulled = false;
    glowMesh.renderOrder = 5;
    scene.add(glowMesh);
  }

  /* ---------- ground mist drifting through the trees ---------- */
  const groundMist = [];
  {
    const tex = T(mistBlobTexture());
    const n = mobile ? 14 : 34;
    for (let i = 0; i < n; i++) {
      const z = 56 - rnd() * 215;
      const x = pathX(clamp(z, -150, 80)) + (rnd() - 0.5) * 44;
      const y = Math.max(pathY(z), terrainHeight(x, z)) + 1.2 + rnd() * 2.2;
      const warm = Math.abs(x - pathX(clamp(z, -150, 80))) < 9;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: warm ? 0x9a7466 : 0x7486a6,
        transparent: true,
        opacity: 0.09 + rnd() * 0.09,
        depthWrite: false,
        fog: false,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(16 + rnd() * 16, 4 + rnd() * 3.5, 1);
      sp.position.set(x, y, z);
      scene.add(sp);
      groundMist.push({ sp, x, ph: rnd() * 10, speed: 0.5 + rnd() });
    }
  }

  /* ---------- embers / fireflies ---------- */
  const emberMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uPR: { value: renderer.getPixelRatio() },
      uColor: { value: new THREE.Color(1.0, 0.55, 0.22) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uMotion; uniform float uPR;
      attribute float aSeed;
      varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * uMotion;
        float cyc = t * 0.22 * (0.5 + aSeed) + aSeed * 37.0;
        float life = fract(cyc / 9.0);
        p.y += life * 9.0;
        p.x += sin(t * 0.5 + aSeed * 30.0) * 0.9;
        p.z += cos(t * 0.4 + aSeed * 17.0) * 0.9;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.6 + aSeed * 2.6) * uPR * (70.0 / max(-mv.z, 1.0));
        float twinkle = 0.55 + 0.45 * sin(uTime * 2.3 * uMotion + aSeed * 61.0);
        float fade = 1.0 - smoothstep(40.0, 110.0, -mv.z);
        vA = sin(life * 3.14159) * twinkle * fade;
        if (uMotion < 0.5) vA = 0.6 * fade;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor * a * vA * 1.8, a * vA);
        #include <colorspace_fragment>
      }`,
  });
  {
    const n = mobile ? 160 : 520;
    const arr = new Float32Array(n * 3);
    const seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const z = 60 - rnd() * 260;
      const x = pathX(clamp(z, -150, 80)) + (rnd() - 0.5) * 34;
      arr.set([x, Math.max(pathY(z), terrainHeight(x, z)) + rnd() * 3 - 1, z], i * 3);
      seeds[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const pts = new THREE.Points(g, emberMat);
    pts.frustumCulled = false;
    scene.add(pts);
  }

  /* ---------- drifting maple leaves ---------- */
  const LEAVES = mobile ? 50 : 170;
  const leafBox = new THREE.Vector3(36, 18, 44);
  const leaves = [];
  let leafMesh;
  {
    // five-lobed maple leaf, stem pointing down
    const shape = new THREE.Shape();
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const lobe = Math.pow(Math.abs(Math.cos(a * 2.5)), 0.7);
      const stem = a > Math.PI * 0.8 && a < Math.PI * 1.2 ? 0.45 : 1;
      const r = 0.045 + 0.085 * lobe * stem;
      const x = Math.sin(a) * r;
      const y = Math.cos(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const geo = new THREE.ShapeGeometry(shape);
    geo.scale(1.3, 1.3, 1.3);
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, emissive: 0x3a0a04 });
    mat.userData.rim = 0.5;
    leafMesh = new THREE.InstancedMesh(geo, mat, LEAVES);
    leafMesh.frustumCulled = false;
    const palette = [0xd2401f, 0xe0662b, 0xb3291a, 0xc9832f];
    for (let i = 0; i < LEAVES; i++) {
      leaves.push({
        o: new THREE.Vector3(rnd() * leafBox.x, rnd() * leafBox.y, rnd() * leafBox.z),
        fall: 0.6 + rnd() * 0.9,
        drift: 0.4 + rnd() * 0.8,
        spin: new THREE.Vector3(rnd() * 2, rnd() * 2, rnd() * 2),
        ph: rnd() * 10,
      });
      leafMesh.setColorAt(i, new THREE.Color(palette[i % palette.length]));
    }
    scene.add(leafMesh);
  }

  /* ---------- camera path ---------- */
  const posPts = [
    new THREE.Vector3(0.5, 3.2, 62), // 01 hero
    P(30, 0.6, 2.6),
    P(14, -3.9, 4.6), // 02 threshold
    P(-3, 0, 2.3),
    P(-14, 0, 2.1), // 03 path
    P(-34, 0, 2.1),
    P(-55, 0, 2.2),
    P(-67, 0.6, 2.9),
    P(-76, 2.6, 4.0), // 04 craft
    P(-99, 0, 4.0),
    new THREE.Vector3(-10, PLAT + 4.4, -141), // 05 afterlight
    new THREE.Vector3(3, PLAT + 11.5, -134),
    new THREE.Vector3(13, PLAT + 15.5, -124), // 06 manifesto
  ];
  const tgtPts = [
    new THREE.Vector3(4, 11, 10),
    P(0, 1, 5),
    P(-24, 2.6, 3.2),
    P(-30, 0, 2.6),
    P(-46, 0, 2.7),
    P(-66, 0, 3),
    P(-86, 0, 3.5),
    P(-100, 0, 4),
    P(-120, -2, 5),
    new THREE.Vector3(-2, PLAT + 6, -160),
    new THREE.Vector3(-4, PLAT + 8.5, -168),
    new THREE.Vector3(3, PLAT + 15, -190),
    new THREE.Vector3(7, PLAT + 22, -205),
  ];
  const anchors = [0, 2, 4, 8, 10, 12];
  const posCurve = new THREE.CatmullRomCurve3(posPts, false, "centripetal");
  const tgtCurve = new THREE.CatmullRomCurve3(tgtPts, false, "centripetal");
  const last = posPts.length - 1;
  const kToU = (k) => {
    const i = clamp(Math.floor(k), 0, anchors.length - 2);
    const t = clamp(k - i, 0, 1);
    return (anchors[i] + (anchors[i + 1] - anchors[i]) * t) / last;
  };

  let targetK = 0;
  let currentK = 0;
  const pointer = new THREE.Vector2();
  const pointerS = new THREE.Vector2();
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const right = new THREE.Vector3();

  // every lit material shares the atmosphere + moon rim light
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((mt) => (mt.isMeshStandardMaterial || mt.isMeshBasicMaterial) && stylize(mt));
  });

  /* ---------- post ----------
     Kuwahara filter flattens 3D detail into brush-like colour patches (the
     hand-painted background look), then bloom, then a film grade. */
  const POST_VS = /* glsl */ `
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const paintPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 1080) } },
    vertexShader: POST_VS,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform vec2 uTexel;
      varying vec2 vUv;
      void main(){
        vec3 m0 = vec3(0.0); vec3 m1 = vec3(0.0); vec3 m2 = vec3(0.0); vec3 m3 = vec3(0.0);
        vec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);
        for (int j = 0; j <= 2; j++) {
          for (int i = 0; i <= 2; i++) {
            vec3 c;
            c = texture2D(tDiffuse, vUv + vec2(-float(i), -float(j)) * uTexel).rgb; m0 += c; s0 += c * c;
            c = texture2D(tDiffuse, vUv + vec2( float(i), -float(j)) * uTexel).rgb; m1 += c; s1 += c * c;
            c = texture2D(tDiffuse, vUv + vec2( float(i),  float(j)) * uTexel).rgb; m2 += c; s2 += c * c;
            c = texture2D(tDiffuse, vUv + vec2(-float(i),  float(j)) * uTexel).rgb; m3 += c; s3 += c * c;
          }
        }
        const float n = 9.0;
        m0 /= n; m1 /= n; m2 /= n; m3 /= n;
        float v0 = dot(s0 / n - m0 * m0, vec3(1.0));
        float v1 = dot(s1 / n - m1 * m1, vec3(1.0));
        float v2 = dot(s2 / n - m2 * m2, vec3(1.0));
        float v3 = dot(s3 / n - m3 * m3, vec3(1.0));
        vec3 col = m0; float best = v0;
        if (v1 < best) { best = v1; col = m1; }
        if (v2 < best) { best = v2; col = m2; }
        if (v3 < best) { col = m3; }
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const gradePass = new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: POST_VS,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      varying vec2 vUv;
      void main(){
        vec2 cc = vUv - 0.5;
        float r2 = dot(cc, cc);
        vec2 off = cc * 0.004 * r2 * 4.0;
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col += vec3(0.006, 0.008, 0.024) * (1.0 - smoothstep(0.0, 0.2, l));      // indigo shadows, never pure black
        col = mix(vec3(l), col, 1.14);                                           // richer colour
        col *= mix(vec3(1.0), vec3(1.07, 0.98, 0.9), smoothstep(0.25, 1.5, l)); // warm highlights
        col *= 1.0 - smoothstep(0.12, 0.7, r2 * 1.5) * 0.5;                      // vignette
        gl_FragColor = vec4(max(col, 0.0), 1.0);
      }`,
  });
  let composer = null;
  let bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(paintPass);
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.82);
    composer.addPass(bloom);
    composer.addPass(gradePass);
    composer.addPass(new OutputPass());
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 64 : 50;
    camera.updateProjectionMatrix();
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
    }
    // brush footprint in CSS pixels, independent of device pixel ratio
    paintPass.uniforms.uTexel.value.set(1.15 / w, 1.15 / h);
  }
  resize();

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let raf = 0;
  let running = false;
  let frame = 0;
  let firstFrameSent = false;
  const dummy = new THREE.Object3D();
  const lightOrder = lightSources.map((_, i) => i);

  function assignLights(t) {
    if (frame % 8 === 0) {
      const cp = camera.position;
      lightOrder.sort((a, b) => lightSources[a].pos.distanceToSquared(cp) - lightSources[b].pos.distanceToSquared(cp));
    }
    for (let i = 0; i < pool.length; i++) {
      const src = lightSources[lightOrder[i]];
      if (!src) continue;
      pool[i].position.copy(src.pos);
      const fl = reducedMotion ? 1 : 0.82 + 0.18 * vnoise(t * 7 + src.seed, src.seed);
      pool[i].intensity = src.base * fl;
    }
  }

  function render() {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    frame++;

    // ease toward scroll target
    currentK = reducedMotion ? targetK : currentK + (targetK - currentK) * (1 - Math.exp(-dt * 3.2));
    const u = kToU(currentK);
    posCurve.getPoint(u, camPos);
    tgtCurve.getPoint(u, camTgt);

    if (!reducedMotion && !mobile) {
      pointerS.lerp(pointer, 1 - Math.exp(-dt * 2.5));
      tmpV.subVectors(camTgt, camPos).normalize();
      right.crossVectors(tmpV, camera.up).normalize();
      camPos.addScaledVector(right, pointerS.x * 0.55);
      camPos.y += pointerS.y * 0.3;
    }
    if (!reducedMotion) {
      camPos.y += Math.sin(t * 0.35) * 0.08;
      camPos.x += Math.sin(t * 0.21) * 0.06;
    }
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    sky.position.copy(camPos);
    if (figure) figure.visible = currentK < 1.6;

    assignLights(t);
    hallLight.intensity = 90 * (reducedMotion ? 1 : 0.9 + 0.1 * vnoise(t * 4, 3.3));

    if (!reducedMotion) {
      emberMat.uniforms.uTime.value = t;
      atmo.uTime.value = t;
      for (const mm of mists) mm.tex.offset.x += mm.s * dt;
      for (const g of groundMist) g.sp.position.x = g.x + Math.sin(t * 0.05 * g.speed + g.ph) * 4;
    }

    // leaves wrap around the camera
    for (let i = 0; i < LEAVES; i++) {
      const L = leaves[i];
      const tt = reducedMotion ? 0 : t;
      const x = L.o.x + Math.sin(tt * 0.6 + L.ph) * 1.2 + tt * L.drift;
      const y = L.o.y - tt * L.fall;
      const z = L.o.z + Math.cos(tt * 0.4 + L.ph) * 1.0;
      const wx = camPos.x - leafBox.x / 2 + ((((x - camPos.x) % leafBox.x) + leafBox.x) % leafBox.x);
      const wy = camPos.y - leafBox.y / 2 + ((((y - camPos.y) % leafBox.y) + leafBox.y) % leafBox.y);
      const wz = camPos.z - leafBox.z * 0.75 + ((((z - camPos.z) % leafBox.z) + leafBox.z) % leafBox.z);
      dummy.position.set(wx, wy, wz);
      dummy.rotation.set(L.spin.x * tt + L.ph, L.spin.y * tt, L.spin.z * tt);
      dummy.updateMatrix();
      leafMesh.setMatrixAt(i, dummy.matrix);
    }
    leafMesh.instanceMatrix.needsUpdate = true;

    if (composer) composer.render(dt);
    else renderer.render(scene, camera);

    if (!firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame?.();
    }
  }

  /* ---------- adaptive quality ----------
     GPU-less browsers fall back to software WebGL, where bloom alone can take
     over a second per frame and freeze the page. Measure real frame times and
     step down: drop the paint filter → drop bloom → lower resolution → hand
     over to the CSS fallback. */
  let quality = mobile ? 1 : 0;
  let sampleStart = 0;
  let sampleFrames = 0;
  let warmup = 6; // first frames include shader compilation

  function resetSample() {
    sampleStart = performance.now();
    sampleFrames = 0;
  }

  function degrade() {
    quality++;

    if (quality === 1) {
      if (composer) composer.removePass(paintPass);
      renderer.setPixelRatio(1);
    } else if (quality === 2) {
      if (composer) {
        bloom.dispose();
        composer.dispose();
        composer = null;
        bloom = null;
      }
    } else if (quality === 3) {
      renderer.setPixelRatio(0.6);
    } else {
      api.stop();
      onTooSlow?.();
      return;
    }
    resize();
    warmup = 3;
    resetSample();
  }

  function measure() {
    if (warmup > 0) {
      warmup--;
      if (warmup === 0) resetSample();
      return;
    }
    sampleFrames++;
    const elapsed = performance.now() - sampleStart;
    if (elapsed < 1200 || sampleFrames < 3) return;
    const avg = elapsed / sampleFrames;
    if (avg > 45) degrade();
    else resetSample();
  }

  function loop() {
    if (!running) return;
    render();
    measure();
    if (running) raf = requestAnimationFrame(loop);
  }

  const api = {
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      warmup = Math.max(warmup, 2); // ignore the stall after a tab switch
      resetSample();
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setProgress(k) {
      targetK = clamp(k, 0, anchors.length - 1);
    },
    jump(k) {
      targetK = currentK = clamp(k, 0, anchors.length - 1);
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    resize,
    renderOnce: render,
    dispose() {
      disposed = true;
      api.stop();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => m.dispose());
        if (o.isInstancedMesh) o.dispose();
      });
      textures.forEach((t) => t.dispose());
      if (bloom) bloom.dispose();
      paintPass.dispose();
      gradePass.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
  return api;
}
