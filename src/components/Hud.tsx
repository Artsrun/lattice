import { useEffect, useRef } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  CHAPTERS,
  DURATION,
  SPEED_MAX,
  SPEED_MIN,
  SPEED_STEP,
  formatSpeed,
  formatTime,
  loopFade,
} from "@/scene/chapters";
import { useReel } from "@/store/reel";

function goPage(id: string) {
  const hash = `#${id}`;
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) {
    useReel.getState().jumpChapter(id);
    return;
  }
  window.location.hash = id;
}

export function Hud() {
  const playing = useReel((s) => s.playing);
  const speed = useReel((s) => s.speed);
  const chapter = useReel((s) => s.chapter);
  const toggle = useReel((s) => s.toggle);
  const setSpeed = useReel((s) => s.setSpeed);
  const nudgeSpeed = useReel((s) => s.nudgeSpeed);
  const skipChapter = useReel((s) => s.skipChapter);
  const restart = useReel((s) => s.restart);
  const setTime = useReel((s) => s.setTime);
  const setPlaying = useReel((s) => s.setPlaying);

  const timeRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLInputElement>(null);
  const speedLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const ch = CHAPTERS.find((c) => c.id === id);
      if (ch) useReel.getState().jumpChapter(ch.id);
    };
    applyHash();
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#lattice");
    }
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = useReel.getState().time;
      const s = useReel.getState().speed;
      if (timeRef.current) timeRef.current.textContent = formatTime(t);
      if (fillRef.current) fillRef.current.style.width = `${(t / DURATION) * 100}%`;
      if (fadeRef.current) fadeRef.current.style.opacity = String(loopFade(t));
      if (rangeRef.current && document.activeElement !== rangeRef.current) {
        rangeRef.current.value = String(t);
      }
      if (speedRef.current && document.activeElement !== speedRef.current) {
        speedRef.current.value = String(s);
      }
      if (speedLabelRef.current) speedLabelRef.current.textContent = formatSpeed(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "Digit1") {
        setSpeed(1);
      } else if (e.code === "Digit2") {
        setSpeed(2);
      } else if (e.code === "Comma" || e.code === "Minus" || e.code === "BracketLeft") {
        nudgeSpeed(-1);
      } else if (e.code === "Period" || e.code === "Equal" || e.code === "BracketRight") {
        nudgeSpeed(1);
      } else if (e.code === "KeyR") {
        restart();
        window.history.replaceState(null, "", "#lattice");
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        const i = CHAPTERS.findIndex((c) => c.id === useReel.getState().chapter.id);
        const next = CHAPTERS[Math.min(CHAPTERS.length - 1, i + 1)];
        if (next) goPage(next.id);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        const i = CHAPTERS.findIndex((c) => c.id === useReel.getState().chapter.id);
        const prev = CHAPTERS[Math.max(0, i - 1)];
        if (prev) goPage(prev.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, setSpeed, nudgeSpeed, restart]);

  const chapterIndex = CHAPTERS.findIndex((c) => c.id === chapter.id);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      <div
        ref={fadeRef}
        className="pointer-events-none absolute inset-0 bg-bg opacity-0"
        aria-hidden
      />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      <header className="pointer-events-none flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Lattice
          </p>
          <p className="mt-2 font-display text-3xl font-semibold leading-none tracking-tight text-fg sm:text-4xl">
            {chapter.label}
          </p>
          <p className="mt-1.5 text-sm text-muted">{chapter.kicker}</p>
          <a
            href={chapter.linkHref}
            target="_blank"
            rel="noreferrer noopener"
            className="pointer-events-auto mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-accent hover:text-fg"
          >
            {chapter.linkLabel}
            <ArrowUpRight className="size-3.5" strokeWidth={1.75} />
          </a>
        </div>
        <p className="hidden text-right text-xs text-faint sm:block">
          {playing ? "Playing" : "Stopped"}
          <br />
          {formatSpeed(speed)}
        </p>
      </header>

      <div className="pointer-events-auto w-full max-w-3xl self-center sm:max-w-none sm:self-stretch">
        <nav aria-label="Sections" className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHAPTERS.map((ch) => {
            const on = ch.id === chapter.id;
            return (
              <a
                key={ch.id}
                href={ch.href}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(ch.id);
                }}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-xs font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                  on
                    ? "border-fg bg-fg text-bg"
                    : "border-border bg-surface/80 text-muted hover:text-fg",
                )}
              >
                {ch.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/80 px-2 py-2 backdrop-blur-sm sm:gap-3 sm:px-3">
          <button
            type="button"
            onClick={() => {
              skipChapter(-1);
              const prev = CHAPTERS[Math.max(0, chapterIndex - 1)];
              if (prev) window.history.replaceState(null, "", prev.href);
            }}
            aria-label="Skip to previous section"
            className="grid size-11 shrink-0 place-items-center rounded-lg text-fg transition-transform duration-150 ease-out hover:bg-bg-elevated active:scale-[0.96]"
          >
            <SkipBack className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="grid size-11 shrink-0 place-items-center rounded-lg bg-fg text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            {playing ? (
              <Pause className="size-4" strokeWidth={1.75} />
            ) : (
              <Play className="size-4 translate-x-px" strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              skipChapter(1);
              const next = CHAPTERS[Math.min(CHAPTERS.length - 1, chapterIndex + 1)];
              if (next) window.history.replaceState(null, "", next.href);
            }}
            aria-label="Skip to next section"
            className="grid size-11 shrink-0 place-items-center rounded-lg text-fg transition-transform duration-150 ease-out hover:bg-bg-elevated active:scale-[0.96]"
          >
            <SkipForward className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              restart();
              window.history.replaceState(null, "", "#lattice");
            }}
            aria-label="Restart"
            className="grid size-11 shrink-0 place-items-center rounded-lg text-fg transition-transform duration-150 ease-out hover:bg-bg-elevated active:scale-[0.96]"
          >
            <RotateCcw className="size-4" strokeWidth={1.75} />
          </button>

          <label className="hidden min-w-0 shrink-0 items-center gap-2 sm:flex">
            <span ref={speedLabelRef} className="w-10 text-right font-mono text-xs tabular-nums text-muted">
              {formatSpeed(speed)}
            </span>
            <input
              ref={speedRef}
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step={SPEED_STEP}
              defaultValue={speed}
              aria-label="Playback speed"
              className="reel-range w-24"
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>

          <div className="relative min-w-0 flex-1">
            <div className="relative h-1.5 overflow-hidden rounded-full bg-border">
              <div ref={fillRef} className="absolute inset-y-0 left-0 rounded-full bg-accent" />
            </div>
            {CHAPTERS.map((ch) => (
              <a
                key={ch.id}
                href={ch.href}
                aria-label={`Skip to ${ch.label}`}
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/80"
                style={{ left: `${(ch.start / DURATION) * 100}%` }}
                onClick={(e) => {
                  e.preventDefault();
                  goPage(ch.id);
                }}
              />
            ))}
            <input
              ref={rangeRef}
              type="range"
              min={0}
              max={DURATION}
              step={0.05}
              defaultValue={0}
              aria-label="Scrub reel"
              className="absolute inset-0 w-full cursor-pointer opacity-0"
              onPointerDown={() => setPlaying(false)}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </div>

          <span
            ref={timeRef}
            className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted"
          >
            00.0
          </span>
        </div>

        <label className="mt-2 flex min-h-11 items-center gap-3 rounded-xl border border-border bg-surface/80 px-3 sm:hidden">
          <span className="text-xs text-muted">Speed</span>
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={SPEED_STEP}
            defaultValue={speed}
            aria-label="Playback speed"
            className="reel-range min-w-0 flex-1"
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="w-10 text-right font-mono text-xs tabular-nums text-muted">
            {formatSpeed(speed)}
          </span>
        </label>
      </div>
    </div>
  );
}
