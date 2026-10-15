import { describe, expect, it } from 'vitest';
import { createPacer, QUALITY_STEPS } from './pacing';

/** Runs rAF at `hz` for `ms`, returning how many frames drew. */
const run = (pacer: ReturnType<typeof createPacer>, from: number, ms: number, hz: number) => {
  let draws = 0;
  const frames = Math.round((ms * hz) / 1000);
  for (let i = 0; i < frames; i++) if (pacer.frame(from + (i * 1000) / hz) !== null) draws++;
  return draws;
};

describe('glass pacing', () => {
  it('caps a 60 Hz display at 30 draws a second', () => expect(run(createPacer(0), 0, 1000, 60)).toBe(30));
  it('caps a 144 Hz display near 30 draws a second', () => {
    const draws = run(createPacer(0), 0, 1000, 144);
    expect(draws).toBeGreaterThanOrEqual(28);
    expect(draws).toBeLessThanOrEqual(30);
  });

  it('keeps full quality when draws hold the pace', () => {
    const pacer = createPacer(0);
    run(pacer, 0, 10_000, 60);
    expect(pacer.quality).toBe(1);
  });

  it('steps down, then switches off, when draws stay slow', () => {
    const pacer = createPacer(0);
    run(pacer, 0, 4000, 15);
    expect(pacer.quality).toBe(QUALITY_STEPS[1]);
    run(pacer, 4000, 4000, 15);
    expect(pacer.quality).toBe(QUALITY_STEPS[2]);
    run(pacer, 8000, 4000, 15);
    expect(pacer.quality).toBe(0);
  });

  it('shrugs off a few long frames', () => {
    const pacer = createPacer(0);
    let t = 0;
    for (let i = 0; i < 300; i++) pacer.frame((t += i % 10 === 0 ? 200 : 1000 / 30));
    expect(pacer.quality).toBe(1);
  });

  it('does not count a hidden-tab gap as a slow draw', () => {
    const pacer = createPacer(0);
    run(pacer, 0, 2000, 60);
    pacer.resume(60_000);
    expect(pacer.frame(60_000)).toBe(0);
    run(pacer, 60_001, 3000, 60);
    expect(pacer.quality).toBe(1);
  });
});
