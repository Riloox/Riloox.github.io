/* Keeps the glass affordable on weak GPUs: it draws at most 30 times a second, and when
   draws can't hold that pace it steps the canvas resolution down, then switches it off. */

export const FRAME_MS = 1000 / 30;
/** rAF timestamps jitter; a frame this close to the next slot still draws. */
const SLACK_MS = 5;
/** Resolution multipliers, best first. Past the last one the glass turns off. */
export const QUALITY_STEPS = [1, 0.7, 0.5] as const;
/** Ignore the first draws after a start, a resume or a step (shader compile, the boot dolly). */
const WARMUP_MS = 1000;
const WINDOW = 40;
/** A median draw interval above this (about 22 fps) means the GPU is falling behind. */
const SLOW_MS = 45;

export interface Pacer {
  /** Call once per animation frame: seconds since the last draw if one is due, else null. */
  frame: (now: number) => number | null;
  /** Forget the timing across a pause (hidden tab) so the gap isn't read as a slow draw. */
  resume: (now: number) => void;
  /** Current resolution multiplier, or 0 once the glass should switch off. */
  readonly quality: number;
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
};

export function createPacer(start: number): Pacer {
  let lastDraw = -Infinity;
  let warmUntil = start + WARMUP_MS;
  let level = 0;
  let samples: number[] = [];

  return {
    frame(now) {
      const interval = now - lastDraw;
      if (interval < FRAME_MS - SLACK_MS) return null;
      lastDraw = now;
      if (!Number.isFinite(interval)) return 0;
      if (now >= warmUntil && level < QUALITY_STEPS.length) {
        samples.push(interval);
        if (samples.length === WINDOW) {
          if (median(samples) > SLOW_MS) {
            level++;
            warmUntil = now + WARMUP_MS;
          }
          samples = [];
        }
      }
      return Math.min(0.1, interval / 1000);
    },
    resume(now) {
      lastDraw = -Infinity;
      warmUntil = now + WARMUP_MS;
      samples = [];
    },
    get quality() {
      return level < QUALITY_STEPS.length ? QUALITY_STEPS[level] : 0;
    },
  };
}
