import { create } from "zustand";
import {
  CHAPTERS,
  DURATION,
  PAGES,
  SHADE,
  chapterAt,
  chapterById,
  chapterHoldTime,
  clampSpeed,
  wrapTime,
  type Chapter,
} from "@/scene/chapters";

type ReelState = {
  playing: boolean;
  speed: number;
  time: number;
  idle: number;
  chapter: Chapter;
  looped: boolean;
  webgl: boolean;
  reduceMotion: boolean;
  shaderFocus: boolean;
  setPlaying: (v: boolean) => void;
  toggle: () => void;
  setSpeed: (v: number) => void;
  nudgeSpeed: (dir: -1 | 1) => void;
  setTime: (t: number) => void;
  advance: (dt: number) => void;
  jumpChapter: (id: string) => void;
  skipChapter: (dir: -1 | 1) => void;
  restart: () => void;
  setWebgl: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
};

export const useReel = create<ReelState>((set, get) => ({
  playing: false,
  speed: 1,
  time: 0,
  idle: 0,
  chapter: CHAPTERS[0]!,
  looped: false,
  webgl: true,
  reduceMotion: false,
  shaderFocus: false,
  setPlaying: (v) => set({ playing: v }),
  toggle: () => {
    const playing = !get().playing;
    if (playing && get().shaderFocus) {
      set({ playing: true, shaderFocus: false, chapter: chapterAt(get().time) });
      return;
    }
    set({ playing });
  },
  setSpeed: (v) => set({ speed: clampSpeed(v) }),
  nudgeSpeed: (dir) => set({ speed: clampSpeed(get().speed + dir * 0.25) }),
  setTime: (t) => {
    const time = wrapTime(t);
    set({ time, chapter: chapterAt(time), shaderFocus: false });
  },
  advance: (dt) => {
    const { playing, speed, time, idle, reduceMotion, shaderFocus } = get();
    const nextIdle = reduceMotion ? idle : idle + dt;
    if (!playing) {
      set({ idle: nextIdle });
      return;
    }
    let next = time + dt * speed;
    let looped = get().looped;
    if (next >= DURATION) {
      next = next % DURATION;
      looped = true;
    }
    set({
      time: next,
      chapter: shaderFocus ? SHADE : chapterAt(next),
      looped,
      idle: nextIdle,
      shaderFocus: playing ? false : shaderFocus,
    });
  },
  jumpChapter: (id) => {
    if (id === SHADE.id) {
      set({ chapter: SHADE, playing: false, shaderFocus: true });
      return;
    }
    const ch = chapterById(id);
    if (!ch) return;
    set({ time: chapterHoldTime(ch), chapter: ch, playing: false, shaderFocus: false });
  },
  skipChapter: (dir) => {
    const i = PAGES.findIndex((c) => c.id === get().chapter.id);
    const next = PAGES[Math.min(PAGES.length - 1, Math.max(0, i + dir))];
    if (!next) return;
    get().jumpChapter(next.id);
  },
  restart: () =>
    set({
      time: 0,
      chapter: CHAPTERS[0]!,
      playing: false,
      looped: false,
      shaderFocus: false,
    }),
  setWebgl: (v) => set({ webgl: v }),
  setReduceMotion: (v) => set({ reduceMotion: v, playing: v ? false : get().playing }),
}));
