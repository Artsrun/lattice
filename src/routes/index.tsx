import { useEffect, useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Hud } from "@/components/Hud";

const loadStage = () => import("@/scene/Stage");
if (typeof window !== "undefined") void loadStage();

export const Route = createFileRoute("/")({
  component: Home,
});

const CUBES: { l: string; t: string; s: number; o: number }[] = [
  { l: "8%", t: "18%", s: 72, o: 0.28 },
  { l: "22%", t: "38%", s: 44, o: 0.4 },
  { l: "38%", t: "14%", s: 96, o: 0.22 },
  { l: "58%", t: "28%", s: 54, o: 0.34 },
  { l: "74%", t: "12%", s: 80, o: 0.26 },
  { l: "14%", t: "62%", s: 60, o: 0.3 },
  { l: "46%", t: "54%", s: 36, o: 0.42 },
  { l: "68%", t: "58%", s: 88, o: 0.24 },
  { l: "82%", t: "42%", s: 48, o: 0.36 },
  { l: "30%", t: "72%", s: 70, o: 0.2 },
];

function Boot() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-bg">
      <canvas className="absolute inset-0 size-full" aria-hidden />
      <div className="absolute inset-0" aria-hidden>
        {CUBES.map((c, i) => (
          <span
            key={i}
            className="absolute rounded-md bg-accent"
            style={{
              left: c.l,
              top: c.t,
              width: c.s,
              height: c.s,
              opacity: c.o,
            }}
          />
        ))}
      </div>
      <div className="absolute left-1/2 top-[44%] h-px w-40 -translate-x-1/2 overflow-hidden bg-border">
        <div className="boot-sweep h-full w-16 bg-accent" />
      </div>
    </div>
  );
}

function Home() {
  const [StageView, setStageView] = useState<ComponentType | null>(null);

  useEffect(() => {
    let live = true;
    void loadStage().then((mod) => {
      if (live) setStageView(() => mod.Stage);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <h1 className="sr-only">Lattice — 20 second architecture reel</h1>
      {StageView ? <StageView /> : <Boot />}
      <Hud />
    </main>
  );
}
