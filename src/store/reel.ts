import { create } from "zustand";
import {
  CHAPTERS,
  DURATION,
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
  setPlaying: (v) => set({ playing: v }),
  toggle: () => set({ playing: !get().playing }),
  setSpeed: (v) => set({ speed: clampSpeed(v) }),
  nudgeSpeed: (dir) => set({ speed: clampSpeed(get().speed + dir * 0.25) }),
  setTime: (t) => {
    const time = wrapTime(t);
    set({ time, chapter: chapterAt(time) });
  },
  advance: (dt) => {
    const { playing, speed, time, idle, reduceMotion } = get();
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
      chapter: chapterAt(next),
      looped,
      idle: nextIdle,
    });
  },
  jumpChapter: (id) => {
    const ch = chapterById(id);
    if (!ch) return;
    set({ time: chapterHoldTime(ch), chapter: ch, playing: false });
  },
  skipChapter: (dir) => {
    const i = CHAPTERS.findIndex((c) => c.id === get().chapter.id);
    const next = CHAPTERS[Math.min(CHAPTERS.length - 1, Math.max(0, i + dir))];
    if (!next) return;
    set({ time: chapterHoldTime(next), chapter: next, playing: false });
  },
  restart: () =>
    set({
      time: 0,
      chapter: CHAPTERS[0]!,
      playing: false,
      looped: false,
    }),
  setWebgl: (v) => set({ webgl: v }),
  setReduceMotion: (v) => set({ reduceMotion: v, playing: v ? false : get().playing }),
}));
