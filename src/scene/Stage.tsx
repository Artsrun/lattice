import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { MatsCtx, TexCtx } from "@/scene/assets";
import { CameraRig } from "@/scene/CameraRig";
import { createMaterials } from "@/scene/materials";
import { C } from "@/scene/theme";
import { createTextures } from "@/scene/textures";
import { ShadeField } from "@/scene/ShadeField";
import { World } from "@/scene/World";
import { useReel } from "@/store/reel";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Stage() {
  const webgl = useMemo(() => hasWebGL(), []);
  const mats = useMemo(() => (webgl ? createMaterials() : null), [webgl]);
  const tex = useMemo(() => (webgl ? createTextures() : null), [webgl]);

  useEffect(() => {
    useReel.getState().setWebgl(webgl);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      useReel.getState().setReduceMotion(true);
    }
  }, [webgl]);

  useEffect(() => {
    return () => {
      mats?.dispose();
      tex?.dispose();
    };
  }, [mats, tex]);

  if (!webgl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg px-8 text-center">
        <div>
          <p className="font-display text-2xl text-fg">Lattice</p>
          <p className="mt-2 text-sm text-muted">WebGL is required for this reel.</p>
        </div>
      </div>
    );
  }

  if (!mats || !tex) return null;

  return (
    <div className="absolute inset-0">
      <Canvas
        className="touch-none"
        style={{ width: "100%", height: "100%", display: "block" }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [7.6, 5.8, 14.8], fov: 46, near: 0.12, far: 140 }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(C.bg);
          scene.fog = new THREE.Fog(C.bg, 18, 86);
        }}
      >
        <MatsCtx.Provider value={mats}>
          <TexCtx.Provider value={tex}>
            <CameraRig />
            <ShadeField />
            <World />
          </TexCtx.Provider>
        </MatsCtx.Provider>
      </Canvas>
    </div>
  );
}
