import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { sampleAt } from "@/scene/chapters";
import { useReel } from "@/store/reel";

export function CameraRig() {
  const camera = useThree((s) => s.camera);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    useReel.getState().advance(d);
    const { pos, look, fov } = sampleAt(useReel.getState().time);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(look[0], look[1], look[2]);
    if (camera instanceof PerspectiveCamera) {
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
