import { createContext, useContext } from "react";
import type { Mats } from "@/scene/materials";
import type { TexBag } from "@/scene/textures";

export const MatsCtx = createContext<Mats | null>(null);
export const TexCtx = createContext<TexBag | null>(null);

export function useMats() {
  const v = useContext(MatsCtx);
  if (!v) throw new Error("MatsCtx");
  return v;
}

export function useTex() {
  const v = useContext(TexCtx);
  if (!v) throw new Error("TexCtx");
  return v;
}
