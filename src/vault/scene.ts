/* Geometry of the painted room. Every number here is in plate pixels: the
   coordinate space of public/vault/room.webp (1536 × 857). */

import type { SectionId } from './sections';

export type Vec2 = readonly [number, number];

export const PLATE = { w: 1536, h: 857 } as const;

/** Inner edge of the CRT glass, clockwise from top-left. */
export const SCREEN_QUAD: readonly [Vec2, Vec2, Vec2, Vec2] = [
  [279, 134],
  [1303, 70],
  [1316, 595],
  [277, 563],
];

/** The HTML terminal is authored at this size, then warped onto the quad. */
export const DESIGN = { w: 1200, h: 545 } as const;

/** The cut-out resident layer and where it sits on the plate. */
export const RESIDENT = { x: 40, y: 432, w: 420, h: 425 } as const;

export const LANTERN: Vec2 = [1474, 386];

/** One painted console button per file, in reading order left to right. */
export const BUTTONS: Record<SectionId, { at: Vec2; lamp: 'amber' | 'red' }> = {
  identity: { at: [563, 737], lamp: 'amber' },
  hostkind: { at: [588, 750], lamp: 'amber' },
  experience: { at: [825, 700], lamp: 'amber' },
  projects: { at: [894, 749], lamp: 'amber' },
  skills: { at: [820, 762], lamp: 'amber' },
  education: { at: [912, 704], lamp: 'red' },
  github: { at: [1021, 786], lamp: 'red' },
  contact: { at: [1184, 796], lamp: 'red' },
};

/** The sticky note painted on the lower-right bezel; the hint is handwritten onto it. */
export const NOTE = { x: 1088, y: 584, w: 112, h: 102, tilt: -3.5 } as const;

export const SCREEN_BOUNDS = (() => {
  const xs = SCREEN_QUAD.map(p => p[0]);
  const ys = SCREEN_QUAD.map(p => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const x1 = Math.max(...xs);
  const y1 = Math.max(...ys);
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();

export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Solves the 8×8 system for the projective map taking the unit rect to `quad`. */
function rectToQuad(w: number, h: number, quad: readonly Vec2[]): Mat3 {
  const src: Vec2[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = quad[i];
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // Gaussian elimination with partial pivoting
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let row = col + 1; row < 8; row++) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let row = 0; row < 8; row++) {
      if (row === col) continue;
      const f = a[row][col] / a[col][col];
      for (let k = col; k < 8; k++) a[row][k] -= f * a[col][k];
      b[row] -= f * b[col];
    }
  }
  const s = b.map((value, i) => value / a[i][i]);
  return [s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], 1];
}

function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    A / det,
    -(b * i - c * h) / det,
    (b * f - c * e) / det,
    B / det,
    (a * i - c * g) / det,
    -(a * f - c * d) / det,
    C / det,
    -(a * h - b * g) / det,
    (a * e - b * d) / det,
  ];
}

/** Design px → plate px. Row-major [a b c; d e f; g h 1]. */
export const SCREEN_H = rectToQuad(DESIGN.w, DESIGN.h, SCREEN_QUAD);
/** Plate px → design px. */
export const SCREEN_H_INV = invert3(SCREEN_H);

/** The same map as a CSS transform (use with transform-origin: 0 0). */
export const SCREEN_MATRIX3D = (() => {
  const [a, b, c, d, e, f, g, h] = SCREEN_H;
  return `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].map(n => +n.toFixed(9)).join(',')})`;
})();

export interface StageView {
  /** plate px → css px scale */
  scale: number;
  /** css px offset of the plate's top-left corner */
  x: number;
  y: number;
}

const clampAxis = (offset: number, plateSize: number, viewSize: number) => {
  if (plateSize <= viewSize) return (viewSize - plateSize) / 2;
  return Math.min(0, Math.max(viewSize - plateSize, offset));
};

/**
 * Overview: cover the viewport with the room, but never crop the screen —
 * on very wide or tall windows we letterbox instead.
 */
export function overviewView(vw: number, vh: number): StageView {
  const cover = Math.max(vw / PLATE.w, vh / PLATE.h);
  const fit = Math.min(vw / (SCREEN_BOUNDS.w + 90), vh / (SCREEN_BOUNDS.h + 70));
  const scale = Math.min(cover, fit);
  const fx = SCREEN_BOUNDS.cx - 30;
  const fy = SCREEN_BOUNDS.cy + 40;
  return {
    scale,
    x: clampAxis(vw / 2 - fx * scale, PLATE.w * scale, vw),
    y: clampAxis(vh / 2 - fy * scale, PLATE.h * scale, vh),
  };
}

/** Reading: dolly in until the glass fills the window. */
export function focusView(vw: number, vh: number): StageView {
  const scale = Math.min(vw / (SCREEN_BOUNDS.w * 1.035), vh / (SCREEN_BOUNDS.h * 1.06));
  return {
    scale,
    x: clampAxis(vw / 2 - SCREEN_BOUNDS.cx * scale, PLATE.w * scale, vw),
    y: clampAxis(vh / 2 - SCREEN_BOUNDS.cy * scale, PLATE.h * scale, vh),
  };
}
