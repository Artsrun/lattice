import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { LATTICE_IMAGE } from "@/scene/latticeImage";
import {
  createShadertoyMaterial,
  createShadertoyPointer,
  feedShadertoyPointer,
  pointerToShadertoy,
  setShadertoyResolution,
  syncShadertoyMouse,
  tickShadertoy,
  type ShadertoyUniforms,
} from "@/scene/shadertoy";
import { useReel } from "@/store/reel";

const noRaycast = () => {};

export function ShadeField() {
  const material = useMemo(() => createShadertoyMaterial(LATTICE_IMAGE), []);
  const uniforms = material.uniforms as ShadertoyUniforms;
  const pointer = useRef(createShadertoyPointer());
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useEffect(() => {
    const canvas = gl.domElement;
    const onPointer = (e: PointerEvent) => {
      const { x, y } = pointerToShadertoy(canvas, e.clientX, e.clientY);
      feedShadertoyPointer(pointer.current, x, y, e.buttons !== 0, e.type === "pointerdown");
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointerup", onPointer);
    canvas.addEventListener("pointerleave", onPointer);
    return () => {
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointerup", onPointer);
      canvas.removeEventListener("pointerleave", onPointer);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const { idle, shaderFocus, chapter, reduceMotion } = useReel.getState();
    const canvas = gl.domElement;
    setShadertoyResolution(uniforms, canvas.width, canvas.height);
    tickShadertoy(uniforms, idle, reduceMotion ? 0 : dt);
    syncShadertoyMouse(uniforms, pointer.current);
    const base = chapter.id === "lattice" ? 0.38 : 0;
    uniforms.uMix.value = shaderFocus ? 1 : base;
  });

  return (
    <mesh
      frustumCulled={false}
      renderOrder={-10}
      position={[0, 0, 0]}
      raycast={noRaycast}
    >
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
