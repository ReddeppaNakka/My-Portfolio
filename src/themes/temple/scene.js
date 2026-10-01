// Night Temple — fully procedural Three.js world.
// Everything (terrain, gates, lanterns, temple, moon, sky, particles) is generated
// in code; there are no external models or textures.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
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

function moonTexture() {
  return canvasTexture(512, 512, (g, w) => {
    const r = w / 2;
    const grd = g.createRadialGradient(r * 0.85, r * 0.8, r * 0.1, r, r, r * 0.92);
    grd.addColorStop(0, "#ffb08a");
    grd.addColorStop(0.45, "#f0683e");
    grd.addColorStop(0.85, "#c93a22");
    grd.addColorStop(1, "#8f2414");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(r, r, r * 0.92, 0, Math.PI * 2);
    g.fill();
    // maria + craters
    g.save();
    g.beginPath();
    g.arc(r, r, r * 0.92, 0, Math.PI * 2);
    g.clip();
    const rnd = mulberry32(7);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w;
      const y = rnd() * w;
      const s = 6 + rnd() * (i < 8 ? 110 : 26);
      const cg = g.createRadialGradient(x, y, 0, x, y, s);
      cg.addColorStop(0, `rgba(110,20,10,${i < 8 ? 0.22 : 0.18})`);
      cg.addColorStop(1, "rgba(110,20,10,0)");
      g.fillStyle = cg;
      g.fillRect(x - s, y - s, s * 2, s * 2);
    }
    g.restore();
    // soft edge
    const edge = g.createRadialGradient(r, r, r * 0.86, r, r, r);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = edge;
    g.fillRect(0, 0, w, w);
  });
}

function glowTexture(inner, outer = "rgba(0,0,0,0)") {
  return canvasTexture(256, 256, (g, w) => {
    const r = w / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, inner);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, w, w);
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

function cedarGeometry() {
  return merge([
    place(new THREE.CylinderGeometry(0.12, 0.2, 3, 5), 0, 1.5, 0),
    place(new THREE.ConeGeometry(1.7, 4.2, 7), 0, 3.6, 0),
    place(new THREE.ConeGeometry(1.35, 3.6, 7), 0, 5.4, 0),
    place(new THREE.ConeGeometry(0.95, 3.0, 7), 0, 7.1, 0),
    place(new THREE.ConeGeometry(0.55, 2.2, 7), 0, 8.6, 0),
  ]);
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
export function createTempleScene(canvas, { mobile = false, reducedMotion = false, onFirstFrame, onTooSlow } = {}) {
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

  /* ---------- sky ---------- */
  const MOON_POS = new THREE.Vector3(116, 300, -760);
  const moonDir = MOON_POS.clone().normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(0x040509) },
      uMid: { value: new THREE.Color(0x0c111b) },
      uHorizon: { value: FOG.clone() },
      uGlow: { value: new THREE.Color(0x5a1d14) },
      uMoonDir: { value: moonDir },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uMoonDir;
      varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 c = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
        c = mix(c, uTop, smoothstep(0.18, 0.75, h));
        float m = max(dot(normalize(vDir), uMoonDir), 0.0);
        c += uGlow * (pow(m, 24.0) * 0.8 + pow(m, 6.0) * 0.12);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), skyMat);
  sky.renderOrder = -10;
  scene.add(sky);

  // stars
  {
    const n = mobile ? 500 : 1400;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = rnd() * Math.PI * 2;
      const y = 0.12 + rnd() * 0.88;
      const r = Math.sqrt(1 - y * y);
      arr.set([Math.cos(th) * r * 1500, y * 1500, Math.sin(th) * r * 1500], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const stars = new THREE.Points(
      g,
      new THREE.PointsMaterial({ color: 0xc9d2e4, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.55, fog: false, depthWrite: false })
    );
    scene.add(stars);
  }

  /* ---------- moon ---------- */
  const moonTex = T(moonTexture());
  const moon = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: moonTex, color: new THREE.Color(1.35, 1.25, 1.2), fog: false, toneMapped: false, depthWrite: false })
  );
  moon.position.copy(MOON_POS);
  moon.scale.setScalar(150);
  scene.add(moon);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: T(glowTexture("rgba(255,110,70,0.55)", "rgba(224,73,47,0)")),
      fog: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.3,
    })
  );
  halo.position.copy(MOON_POS).multiplyScalar(1.01);
  halo.scale.setScalar(470);
  scene.add(halo);

  /* ---------- far mountains (atmospheric layers) ---------- */
  const ridgeColors = [0x0b1018, 0x111824, 0x18202d, 0x202938];
  const ridgeZ = [-330, -430, -540, -660];
  ridgeColors.forEach((col, li) => {
    const shape = new THREE.Shape();
    const W = 1500;
    shape.moveTo(-W, -80);
    for (let x = -W; x <= W; x += 12) {
      const n = fbm(x * 0.0042 + li * 9.3, li * 3.7, 5);
      const peak = Math.pow(n, 1.7) * (70 + li * 34) + 8 + li * 14;
      shape.lineTo(x, peak);
    }
    shape.lineTo(W, -80);
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color: col, fog: false })
    );
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
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, terrainHeight(x, z));
      const n = fbm(x * 0.08, z * 0.08, 3);
      tmp.copy(cA).lerp(cB, n).lerp(cMoss, fbm(x * 0.02 + 5, z * 0.02, 2) * 0.8);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
    scene.add(terrain);
  }

  /* ---------- stairs + approach flagstones ---------- */
  {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5b5f63, roughness: 0.95 });
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
      col.setRGB(0.75 + rnd() * 0.3, 0.75 + rnd() * 0.3, 0.78 + rnd() * 0.3);
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
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc4301b, roughness: 0.6, emissive: 0x2a0602, emissiveIntensity: 1 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.7 });
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
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6b6d6f, roughness: 1 });
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
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1b2026, roughness: 0.75, metalness: 0.15, side: THREE.DoubleSide, flatShading: true });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4e5257, roughness: 1 });
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
    const n = mobile ? 260 : 620;
    const geo = cedarGeometry();
    const mat = new THREE.MeshStandardMaterial({ color: 0x0d1512, roughness: 1 });
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
      col.setRGB(v, v, v);
      mesh.setColorAt(placed, col);
      placed++;
    }
    mesh.count = placed;
    scene.add(mesh);
  }

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0x33415c, 0x07080a, 0.9));
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
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.12);
    shape.quadraticCurveTo(0.12, -0.02, 0.07, 0.12);
    shape.quadraticCurveTo(0, 0.08, -0.07, 0.12);
    shape.quadraticCurveTo(-0.12, -0.02, 0, -0.12);
    const geo = new THREE.ShapeGeometry(shape);
    geo.scale(1.3, 1.3, 1.3);
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, emissive: 0x3a0a04 });
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

  /* ---------- post ---------- */
  let composer = null;
  let bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.62, 0.55, 0.78);
    composer.addPass(bloom);
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

    assignLights(t);
    hallLight.intensity = 90 * (reducedMotion ? 1 : 0.9 + 0.1 * vnoise(t * 4, 3.3));

    if (!reducedMotion) {
      emberMat.uniforms.uTime.value = t;
      for (const mm of mists) mm.tex.offset.x += mm.s * dt;
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
     step down: drop bloom → lower resolution → hand over to the CSS fallback. */
  let quality = 0;
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
      if (composer) {
        bloom.dispose();
        composer.dispose();
        composer = null;
        bloom = null;
      }
      renderer.setPixelRatio(1);
    } else if (quality === 2) {
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
      api.stop();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => m.dispose());
        if (o.isInstancedMesh) o.dispose();
      });
      textures.forEach((t) => t.dispose());
      if (bloom) bloom.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
  return api;
}
