import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGithubProjects } from '../hooks/useGithubProjects';
import { Dashboard } from './Dashboard';
import type { Glass, GlassFrame } from './glass';
import { createPacer } from './pacing';
import { SectionBody } from './SectionView';
import { BUTTONS, DESIGN, NOTE, PLATE, RESIDENT, SCREEN_MATRIX3D, focusView, overviewView } from './scene';
import { SECTIONS, isSectionId, type SectionId } from './sections';
import './vault.css';

const GITHUB = 'Riloox';
const EXCLUDED = ['picadito', 'personalWebpage'];
const ASSETS = `${import.meta.env.BASE_URL}vault/`;
/** Overscan past each viewport edge; must exceed the largest pointer-parallax travel (23px). */
const PARALLAX_BLEED = 28;

/** From the overview, the file's console button lights this long before the screen switches. */
const PRESS_MS = 140;

/** After the camera is placed, the glass re-measures the room for this long: the longest
    camera transition in vault.css (1.2s) plus a margin. */
const CAMERA_SETTLE_MS = 1300;

const BOOT_LOG = [
  'ATOMLINE INDUSTRIES (R) DEEPLINE TERMINAL v2.3',
  'SHELTER 23 · PERSONNEL RECORDS DIVISION',
  '> MOUNT /personnel/prunell_f ............ OK',
  '> VERIFY CLEARANCE ...................... GRANTED',
  '> INDEX 8 FILES ......................... OK',
];

type Phase = 'loading' | 'boot' | 'ready';

const HANDHELD_QUERY = '(max-width: 760px), (max-aspect-ratio: 4/5)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

const initialFile = (): SectionId | null => {
  const hash = typeof location !== 'undefined' ? location.hash.slice(1) : '';
  const query = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('focus') : null;
  if (isSectionId(hash)) return hash;
  if (isSectionId(query)) return query;
  return null;
};

export default function VaultApp() {
  const handheld = useMedia(HANDHELD_QUERY);
  const reduced = useMedia(REDUCED_QUERY);
  const github = useGithubProjects(GITHUB, { limit: 6, excludeNames: EXCLUDED });

  const hostRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const residentRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<SectionId | null>(null);
  const powerRef = useRef(0);
  /** When the camera last moved; the glass loop only reads layout while it settles. */
  const cameraMovedRef = useRef(0);

  const [phase, setPhase] = useState<Phase>('loading');
  const [bootStep, setBootStep] = useState(0);
  const [roomLoaded, setRoomLoaded] = useState(false);
  const [file, setFile] = useState<SectionId | null>(initialFile);
  const [glassOn, setGlassOn] = useState(false);
  const [lamp, setLamp] = useState<{ id: SectionId; n: number } | null>(null);
  const pressTimerRef = useRef(0);

  /* ------------------------------------------------------------ boot */
  useEffect(() => {
    if (!roomLoaded) return;
    let cancelled = false;
    const timers: number[] = [];
    const fonts = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
    void fonts.then(() => {
      if (cancelled) return;
      powerRef.current = 1;
      if (reduced || initialFile()) {
        setBootStep(BOOT_LOG.length);
        setPhase('ready');
        return;
      }
      setPhase('boot');
      BOOT_LOG.forEach((_, i) => timers.push(window.setTimeout(() => setBootStep(i + 1), 520 + i * 300)));
      timers.push(window.setTimeout(() => setPhase('ready'), 520 + BOOT_LOG.length * 300 + 650));
    });
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [roomLoaded, reduced]);

  const skipBoot = useCallback(() => {
    setBootStep(BOOT_LOG.length);
    setPhase('ready');
  }, []);

  /* ------------------------------------------------------- navigation */
  const openFile = useCallback((id: SectionId) => {
    setFile(current => {
      if (!current) returnFocusRef.current = id;
      return id;
    });
    history.replaceState(null, '', `#${id}`);
  }, []);

  const closeFile = useCallback(() => {
    setFile(null);
    history.replaceState(null, '', location.pathname + location.search.replace(/[?&]focus=[^&]*/, ''));
  }, []);

  /** From the overview the file's console button lights first; once reading, files just switch. */
  const press = useCallback(
    (id: SectionId) => {
      if (file || handheld) {
        openFile(id);
        return;
      }
      if (pressTimerRef.current) return;
      setLamp(current => ({ id, n: (current?.n ?? 0) + 1 }));
      pressTimerRef.current = window.setTimeout(() => {
        pressTimerRef.current = 0;
        openFile(id);
      }, PRESS_MS);
    },
    [file, handheld, openFile],
  );

  useEffect(() => () => window.clearTimeout(pressTimerRef.current), []);

  useEffect(() => {
    if (file) {
      fileHeadingRef.current?.focus({ preventScroll: true });
    } else if (returnFocusRef.current) {
      document.getElementById(`t-${returnFocusRef.current}`)?.focus({ preventScroll: true });
      returnFocusRef.current = null;
    }
  }, [file]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (phase === 'boot') {
        skipBoot();
        return;
      }
      if (phase !== 'ready' || handheld) return;
      if (event.key === 'Escape' && file) {
        closeFile();
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable]')) return;
      if (event.key >= '1' && event.key <= '8') {
        press(SECTIONS[Number(event.key) - 1].id);
        return;
      }
      if (file && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        const index = SECTIONS.findIndex(section => section.id === file);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        openFile(SECTIONS[(index + step + SECTIONS.length) % SECTIONS.length].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeFile, file, handheld, openFile, phase, press, skipBoot]);

  /* ----------------------------------------------------------- camera */
  const pointer = useRef({ x: 0, y: 0 });

  const placeCamera = useCallback(() => {
    const host = hostRef.current;
    const stage = stageRef.current;
    const resident = residentRef.current;
    if (!host || !stage || !resident) return;
    cameraMovedRef.current = performance.now();
    const { width, height } = host.getBoundingClientRect();
    // Overview frames a viewport inflated by PARALLAX_BLEED on every side, so pointer
    // parallax (room ±7/5px, resident another ±16/9px) never drags a plate edge into view.
    const view = file
      ? focusView(width, height)
      : (() => {
          const v = overviewView(width + PARALLAX_BLEED * 2, height + PARALLAX_BLEED * 2);
          return { ...v, x: v.x - PARALLAX_BLEED, y: v.y - PARALLAX_BLEED };
        })();
    stage.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`;
    const p = pointer.current;
    // dolly past him: a foreground subject drops out of frame first. Pointer parallax rides on
    // `translate` so mouse moves never restart the slower dolly transition on `transform`.
    resident.style.transform = file ? 'translate3d(-34%, 52%, 0) scale(1.22)' : 'translate3d(0, 0, 0)';
    resident.style.translate = file ? '0px 0px' : `${-p.x * 16}px ${-p.y * 9}px`;
    const parallax = parallaxRef.current;
    if (parallax) parallax.style.transform = file ? 'none' : `translate3d(${-p.x * 7}px, ${-p.y * 5}px, 0)`;
  }, [file]);

  useLayoutEffect(() => {
    if (handheld) return;
    placeCamera();
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(placeCamera);
    observer.observe(host);
    return () => observer.disconnect();
  }, [handheld, placeCamera]);

  useEffect(() => {
    if (handheld || reduced) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(placeCamera);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [handheld, placeCamera, reduced]);

  /* ------------------------------------------------------------ glass */
  useEffect(() => {
    if (handheld || !roomLoaded) return;
    const canvas = canvasRef.current;
    const host = hostRef.current;
    const stage = stageRef.current;
    const resident = residentRef.current;
    if (!canvas || !host || !stage || !resident) return;

    let glass: Glass | null = null;
    let raf = 0;
    let disposed = false;
    let power = 0;
    const start = performance.now();
    const pacer = createPacer(start);
    let quality = pacer.quality;
    let view: Pick<GlassFrame, 'stage' | 'resident'> | null = null;
    let lastKey = '';

    const measure = (): Pick<GlassFrame, 'stage' | 'resident'> => {
      const hostBox = host.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      const r = resident.getBoundingClientRect();
      return {
        stage: { scale: s.width / PLATE.w, x: s.left - hostBox.left, y: s.top - hostBox.top },
        resident: { x: r.left - hostBox.left, y: r.top - hostBox.top, w: r.width, h: r.height },
      };
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!glass) return;
      const dt = pacer.frame(now);
      if (dt === null) return;
      if (pacer.quality !== quality) {
        quality = pacer.quality;
        if (!quality) {
          // this GPU can't keep up: fall back to the painted room alone
          cancelAnimationFrame(raf);
          glass.dispose();
          glass = null;
          setGlassOn(false);
          return;
        }
        glass.setQuality(quality);
        lastKey = '';
      }
      power += (powerRef.current - power) * Math.min(1, dt * 2.2);
      // reading layout every frame is costly; the room only moves while the camera settles
      if (!view || now - cameraMovedRef.current < CAMERA_SETTLE_MS) view = measure();
      const frame = { ...view, power, time: reduced ? 4.2 : (now - start) / 1000 };
      if (reduced) {
        // static film: only redraw when something actually moved
        const key = `${view.stage.scale}|${view.stage.x}|${view.stage.y}|${view.resident.x}|${view.resident.y}|${power.toFixed(3)}`;
        if (key === lastKey) return;
        lastKey = key;
      }
      glass.render(frame);
    };

    const resize = () => {
      const box = host.getBoundingClientRect();
      glass?.resize(box.width, box.height);
      view = null;
      lastKey = '';
    };
    const observer = new ResizeObserver(resize);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && glass) {
        pacer.resume(performance.now());
        raf = requestAnimationFrame(loop);
      }
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      setGlassOn(false);
    };

    void import('./glass')
      .then(({ createGlass }) => {
        if (disposed) return;
        try {
          glass = createGlass(canvas, `${ASSETS}resident.webp`);
        } catch {
          return; // no WebGL: the painted room and the terminal still work
        }
        resize();
        observer.observe(host);
        setGlassOn(true);
        raf = requestAnimationFrame(loop);
        document.addEventListener('visibilitychange', onVisibility);
        canvas.addEventListener('webglcontextlost', onLost);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      glass?.dispose();
    };
  }, [handheld, reduced, roomLoaded]);

  /* ----------------------------------------------------------- render */
  const current = file ? SECTIONS.find(section => section.id === file)! : null;
  const terminal =
    phase === 'ready' ? (
      current ? (
        <FileView
          current={current}
          headingRef={fileHeadingRef}
          loading={github.loading}
          onClose={closeFile}
          onOpen={openFile}
          repos={github.repos}
        />
      ) : (
        <Dashboard loading={github.loading} onOpen={press} repos={github.repos} />
      )
    ) : (
      <BootLog onSkip={skipBoot} step={bootStep} />
    );

  if (handheld) {
    return (
      <div className="vault-handheld">
        <HandheldRoom onLoad={() => setRoomLoaded(true)} />
        <main className="hh-terminal crt-type">
          <p className="hh-brand">ATOMLINE · DEEPLINE TERMINAL · SHELTER 23</p>
          {phase === 'ready' ? (
            SECTIONS.map(section => (
              <section className="hh-file" id={section.id} key={section.id}>
                <h2>
                  <span>&gt; {section.index}</span> {section.title}
                </h2>
                <SectionBody id={section.id} loading={github.loading} repos={github.repos} />
              </section>
            ))
          ) : (
            <BootLog onSkip={skipBoot} step={bootStep} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div
      className={`vault-host${file ? ' is-reading' : ''}${glassOn ? ' has-glass' : ''}${roomLoaded ? ' is-lit' : ''}`}
      ref={hostRef}
      onClick={event => {
        if (file && !(event.target as HTMLElement).closest('.crt')) closeFile();
      }}
    >
      <div className="vault-parallax" ref={parallaxRef}>
        <div className="vault-stage" ref={stageRef} style={{ width: PLATE.w, height: PLATE.h }}>
          <img
            alt="A helmeted resident in a number 23 jumpsuit sits at a riveted bunker console, facing a wide green terminal screen."
            className="vault-room"
            decoding="async"
            onLoad={() => setRoomLoaded(true)}
            src={`${ASSETS}room.webp`}
          />
          <div
            className={`crt crt-type is-${phase}`}
            style={{ width: DESIGN.w, height: DESIGN.h, transform: SCREEN_MATRIX3D }}
          >
            <div className="crt-content" key={phase === 'ready' ? file ?? 'home' : 'boot'}>
              {terminal}
            </div>
          </div>
          {lamp && (
            <span
              aria-hidden="true"
              className={`vault-lamp is-${BUTTONS[lamp.id].lamp}`}
              key={lamp.n}
              style={{ left: BUTTONS[lamp.id].at[0], top: BUTTONS[lamp.id].at[1] }}
            />
          )}
          <div
            aria-hidden="true"
            className={`vault-note${phase === 'ready' && !file ? ' is-up' : ''}`}
            style={{ left: NOTE.x, top: NOTE.y, width: NOTE.w, height: NOTE.h, rotate: `${NOTE.tilt}deg` }}
          >
            <span>click a panel</span>
            <span>1–8 open files</span>
          </div>
          <img
            alt=""
            className="vault-resident"
            ref={residentRef}
            src={`${ASSETS}resident.webp`}
            style={{ left: RESIDENT.x, top: RESIDENT.y, width: RESIDENT.w, height: RESIDENT.h }}
          />
        </div>
      </div>
      <canvas aria-hidden="true" className="vault-glass" ref={canvasRef} />
    </div>
  );
}

/** Phones get the same room as a banner: plate, a lit screen and the resident. */
function HandheldRoom({ onLoad }: { onLoad: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return;
    const place = () => {
      const { width, height } = box.getBoundingClientRect();
      const scale = Math.max(width / 980, height / PLATE.h);
      // frame the resident's head and the left half of the glass
      const x = Math.min(0, Math.max(width - PLATE.w * scale, width * 0.42 - 470 * scale));
      const y = Math.min(0, Math.max(height - PLATE.h * scale, height * 0.5 - 410 * scale));
      stage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="hh-room" ref={boxRef} aria-hidden="true">
      <div className="vault-stage" ref={stageRef} style={{ width: PLATE.w, height: PLATE.h }}>
        <img alt="" className="vault-room hh-plate" onLoad={onLoad} src={`${ASSETS}room.webp`} />
        <div className="crt crt-type hh-crt" style={{ width: DESIGN.w, height: DESIGN.h, transform: SCREEN_MATRIX3D }}>
          <p className="hh-crt-name">
            <span>Federico</span>
            <span>Prunell</span>
          </p>
          <p className="hh-crt-role">AI agent infra · Montevideo</p>
        </div>
        <img
          alt=""
          className="vault-resident hh-resident"
          src={`${ASSETS}resident.webp`}
          style={{ left: RESIDENT.x, top: RESIDENT.y, width: RESIDENT.w, height: RESIDENT.h }}
        />
      </div>
    </div>
  );
}

function BootLog({ step, onSkip }: { step: number; onSkip: () => void }) {
  return (
    <div className="t-boot" role="log" aria-live="polite">
      <ul>
        {BOOT_LOG.slice(0, step).map(line => (
          <li key={line}>{line}</li>
        ))}
        <li className="t-cursor" aria-hidden="true" />
      </ul>
      <button type="button" onClick={onSkip}>
        skip boot &gt;
      </button>
    </div>
  );
}

function FileView({
  current,
  headingRef,
  loading,
  onClose,
  onOpen,
  repos,
}: {
  current: (typeof SECTIONS)[number];
  headingRef: React.RefObject<HTMLHeadingElement>;
  loading: boolean;
  onClose: () => void;
  onOpen: (id: SectionId) => void;
  repos: ReturnType<typeof useGithubProjects>['repos'];
}) {
  return (
    <div className="t-file" role="region" aria-labelledby="t-file-title">
      <nav className="t-file-nav" aria-label="Files">
        <p className="t-file-nav-head">/personnel/prunell_f</p>
        <ul>
          {SECTIONS.map(section => (
            <li key={section.id}>
              <button
                aria-current={section.id === current.id ? 'page' : undefined}
                onClick={() => onOpen(section.id)}
                type="button"
              >
                <b>{section.index}</b>
                {section.title}
              </button>
            </li>
          ))}
        </ul>
        <button className="t-btn t-file-back" onClick={onClose} type="button">
          &lt; Back <kbd>esc</kbd>
        </button>
      </nav>
      <article className="t-file-body">
        <header className="t-panel-head t-file-head">
          <h2 id="t-file-title" ref={headingRef} tabIndex={-1}>
            <span className="t-caret" aria-hidden="true">&gt;</span>
            {current.index} / {current.title}
          </h2>
          <i aria-hidden="true">← → switch</i>
        </header>
        <div className="t-file-scroll">
          <SectionBody id={current.id} loading={loading} repos={repos} />
        </div>
      </article>
    </div>
  );
}
