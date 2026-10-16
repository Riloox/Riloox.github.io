/* The live layer over the painted room: CRT glass, screen spill, the lantern's
   flicker, dust in the light and film grain. One full-screen pass plus a few
   hundred points; it never touches the DOM, so the terminal stays crisp. */

import * as THREE from 'three';
import { DESIGN, LANTERN, PLATE, SCREEN_H_INV } from './scene';

export interface GlassFrame {
  /** plate → css: scale and offset of the room */
  stage: { scale: number; x: number; y: number };
  /** css rect of the resident layer */
  resident: { x: number; y: number; w: number; h: number };
  /** 0 = screen off, 1 = on */
  power: number;
  time: number;
}

export interface Glass {
  render: (frame: GlassFrame) => void;
  resize: (width: number, height: number) => void;
  /** Scales the canvas resolution: 1 is full, lower trades sharpness for GPU time. */
  setQuality: (quality: number) => void;
  dispose: () => void;
}

const QUAD_VERT = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const QUAD_FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform vec3 uStage;
  uniform vec4 uResRect;
  uniform sampler2D uResTex;
  uniform float uResReady;
  uniform mat3 uHinv;
  uniform vec2 uDesign;
  uniform vec2 uPlate;
  uniform vec2 uLantern;
  uniform float uTime;
  uniform float uPower;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  float matte(vec2 css) {
    vec2 uv = (css - uResRect.xy) / uResRect.zw;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
    return texture2D(uResTex, vec2(uv.x, 1.0 - uv.y)).a * uResReady;
  }

  // a lantern flame: two slow wobbles and a fast shiver
  float flame(float t) {
    return 0.82 + 0.1 * sin(t * 1.7) * sin(t * 2.9 + 1.3) + 0.08 * sin(t * 13.0) * sin(t * 7.3);
  }

  void main() {
    vec2 css = vec2(gl_FragCoord.x / uDpr, uRes.y - gl_FragCoord.y / uDpr);
    vec2 p = (css - uStage.yz) / uStage.x;

    vec3 q = uHinv * vec3(p, 1.0);
    vec2 suv = (q.xy / q.z) / uDesign;
    float inside = smoothstep(-0.002, 0.003, suv.x) * smoothstep(-0.002, 0.003, 1.0 - suv.x)
                 * smoothstep(-0.003, 0.004, suv.y) * smoothstep(-0.003, 0.004, 1.0 - suv.y);

    float m = matte(css);
    float fl = flame(uTime);
    float hum = 0.97 + 0.03 * sin(uTime * 60.0) * sin(uTime * 3.1);

    vec3 add = vec3(0.0);
    float dark = 0.0;

    /* ---- the glass ---- */
    float g = inside * (1.0 - m);
    float e = min(min(suv.x, 1.0 - suv.x) * (uDesign.x / uDesign.y), min(suv.y, 1.0 - suv.y));
    float tube = 1.0 - smoothstep(0.0, 0.16, e);
    dark += g * tube * tube * 0.6;
    float roll = exp(-pow((suv.y - fract(uTime * 0.075)) * 14.0, 2.0));
    add += g * uPower * roll * vec3(0.03, 0.09, 0.05);
    float sheen = smoothstep(0.28, 0.0, abs(suv.x * 0.55 + suv.y - 0.32)) * (1.0 - suv.y);
    add += g * sheen * 0.022 * vec3(0.75, 1.0, 0.85);
    float lr = exp(-pow(length((p - vec2(1277.0, 296.0)) / vec2(55.0, 150.0)), 2.0));
    add += g * lr * fl * vec3(0.22, 0.12, 0.035);
    add += g * uPower * vec3(0.0, 0.010, 0.005) * (hash(vec2(floor(uTime * 24.0), 3.0)) - 0.3);

    /* ---- phosphor light spilling onto the bezel, desk and wall ---- */
    vec2 over = max(abs(suv - 0.5) - 0.5, 0.0) * vec2(1030.0, 480.0);
    float dpx = length(over);
    float spill = exp(-dpx / 70.0) * 0.12 + exp(-dpx / 300.0) * 0.06;
    // the room takes it fully; his back only catches a little, with no seam at the glass edge
    float receive = (1.0 - inside) * (1.0 - m) + m * 0.3;
    add += receive * spill * uPower * hum * vec3(0.10, 0.80, 0.38);

    /* ---- the resident: green rim where he faces the glass ---- */
    vec2 toward = normalize(vec2(0.78, -0.62));
    float mo = matte(css + toward * max(3.0, 4.5 * uStage.x));
    float rim = clamp(m - mo, 0.0, 1.0);
    add += rim * uPower * hum * vec3(0.16, 0.95, 0.48) * 0.26;
    add += m * uPower * vec3(0.0, 0.03, 0.015);

    /* ---- lantern ---- */
    float ld = length(p - uLantern);
    add += vec3(1.0, 0.56, 0.2) * (exp(-ld / 34.0) * 0.16 + exp(-ld / 230.0) * 0.07) * (fl - 0.55);
    dark += (1.0 - fl) * 0.22 * exp(-ld / 520.0);

    /* ---- lens: vignette and grain ---- */
    vec2 vuv = css / uRes - 0.5;
    dark += smoothstep(0.42, 0.95, length(vuv * vec2(1.0, 1.25))) * 0.6;
    float n = hash(floor(css * 0.9) + fract(uTime * 7.31) * 113.0) - 0.5;
    add += max(n, 0.0) * 0.045;
    dark += max(-n, 0.0) * 0.06;

    dark = clamp(dark, 0.0, 0.92);
    gl_FragColor = vec4(add, dark);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute vec4 aSeed;
  uniform vec2 uRes;
  uniform vec3 uStage;
  uniform vec2 uPlate;
  uniform vec2 uLantern;
  uniform float uTime;
  uniform float uDpr;
  varying float vLight;
  varying float vWarm;

  void main() {
    float speed = 3.0 + 9.0 * aSeed.z;
    vec2 p = vec2(mix(160.0, uPlate.x, aSeed.x), mod(aSeed.y * uPlate.y + uTime * speed, uPlate.y));
    p.x += sin(uTime * (0.15 + 0.2 * aSeed.w) + aSeed.w * 6.283) * 18.0;
    vec2 css = p * uStage.x + uStage.yz;
    gl_Position = vec4(css.x / uRes.x * 2.0 - 1.0, 1.0 - css.y / uRes.y * 2.0, 0.0, 1.0);

    float lamp = exp(-length(p - uLantern) / 260.0);
    float screen = smoothstep(700.0, 120.0, p.y) * 0.3;
    vLight = lamp * 0.9 + screen;
    vWarm = lamp / (lamp + screen + 0.001);
    float depth = 0.6 + 2.6 * aSeed.z * aSeed.z;
    gl_PointSize = depth * uStage.x * uDpr;
  }
`;

const DUST_FRAG = /* glsl */ `
  precision mediump float;
  varying float vLight;
  varying float vWarm;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vLight * 0.55;
    vec3 c = mix(vec3(0.55, 1.0, 0.7), vec3(1.0, 0.78, 0.5), vWarm);
    gl_FragColor = vec4(c * a, 0.0);
  }
`;

const DUST_COUNT = 170;

export function createGlass(canvas: HTMLCanvasElement, residentSrc: string): Glass {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const res = new THREE.Vector2(1, 1);
  const stage = new THREE.Vector3(1, 0, 0);
  const time = { value: 0 };
  const shared = {
    uRes: { value: res },
    uDpr: { value: dpr },
    uStage: { value: stage },
    uPlate: { value: new THREE.Vector2(PLATE.w, PLATE.h) },
    uLantern: { value: new THREE.Vector2(...LANTERN) },
    uTime: time,
  };

  const residentTex = new THREE.TextureLoader().load(residentSrc, () => {
    quadMat.uniforms.uResReady.value = 1;
  });
  residentTex.minFilter = THREE.LinearFilter;
  residentTex.generateMipmaps = false;

  const quadMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: QUAD_FRAG,
    uniforms: {
      ...shared,
      uResRect: { value: new THREE.Vector4() },
      uResTex: { value: residentTex },
      uResReady: { value: 0 },
      uHinv: { value: new THREE.Matrix3().set(...SCREEN_H_INV) },
      uDesign: { value: new THREE.Vector2(DESIGN.w, DESIGN.h) },
      uPower: { value: 0 },
    },
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat);
  quad.frustumCulled = false;
  scene.add(quad);

  const seeds = new Float32Array(DUST_COUNT * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  // three wants a position attribute to know the draw count
  dustGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUST_COUNT * 3), 3));
  const dustMat = new THREE.ShaderMaterial({
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    uniforms: shared,
    transparent: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
    depthTest: false,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  dust.renderOrder = 1;
  scene.add(dust);

  return {
    render(frame) {
      stage.set(frame.stage.scale, frame.stage.x, frame.stage.y);
      quadMat.uniforms.uResRect.value.set(frame.resident.x, frame.resident.y, frame.resident.w, frame.resident.h);
      quadMat.uniforms.uPower.value = frame.power;
      time.value = frame.time;
      renderer.render(scene, camera);
    },
    resize(width, height) {
      res.set(width, height);
      renderer.setSize(width, height, false);
    },
    setQuality(quality) {
      // the shaders map gl_FragCoord back to css px through uDpr, so the two move together
      shared.uDpr.value = dpr * quality;
      renderer.setPixelRatio(dpr * quality);
    },
    dispose() {
      quad.geometry.dispose();
      quadMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      residentTex.dispose();
      renderer.dispose();
    },
  };
}
