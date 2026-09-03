import * as THREE from "three";
import { C } from "@/scene/theme";

export function createMaterials() {
  const cube = new THREE.MeshStandardMaterial({
    color: C.cube,
    emissive: C.cubeEmissive,
    emissiveIntensity: 0.62,
    roughness: 0.32,
    metalness: 0.18,
    transparent: true,
    opacity: 0.78,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: C.cubeHi,
    emissive: C.cubeEmissive,
    emissiveIntensity: 0.2,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  const silver = new THREE.MeshStandardMaterial({
    color: C.silver,
    roughness: 0.28,
    metalness: 0.72,
  });
  const silver2 = new THREE.MeshStandardMaterial({
    color: C.silver2,
    roughness: 0.38,
    metalness: 0.55,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: C.gold,
    emissive: C.goldE,
    emissiveIntensity: 0.45,
    roughness: 0.32,
    metalness: 0.7,
  });
  const orange = new THREE.MeshStandardMaterial({
    color: C.orange,
    emissive: C.orange,
    emissiveIntensity: 0.18,
    roughness: 0.4,
    metalness: 0.35,
  });
  const pcb = new THREE.MeshStandardMaterial({
    color: C.pcb,
    roughness: 0.62,
    metalness: 0.22,
  });
  const navy = new THREE.MeshStandardMaterial({
    color: C.navy,
    roughness: 0.45,
    metalness: 0.35,
  });
  const navyDeep = new THREE.MeshStandardMaterial({
    color: C.navyDeep,
    roughness: 0.5,
    metalness: 0.25,
  });
  const ice = new THREE.MeshStandardMaterial({
    color: C.ice,
    roughness: 0.35,
    metalness: 0.2,
  });
  const black = new THREE.MeshStandardMaterial({
    color: C.black,
    roughness: 0.55,
    metalness: 0.4,
  });
  const cream = new THREE.MeshStandardMaterial({
    color: "#e8c98a",
    roughness: 0.35,
    metalness: 0.45,
  });
  const wire = new THREE.LineBasicMaterial({
    color: C.wire,
    transparent: true,
    opacity: 0.28,
  });

  return {
    cube,
    glass,
    silver,
    silver2,
    gold,
    orange,
    pcb,
    navy,
    navyDeep,
    ice,
    black,
    cream,
    wire,
    dispose() {
      cube.dispose();
      glass.dispose();
      silver.dispose();
      silver2.dispose();
      gold.dispose();
      orange.dispose();
      pcb.dispose();
      navy.dispose();
      navyDeep.dispose();
      ice.dispose();
      black.dispose();
      cream.dispose();
      wire.dispose();
    },
  };
}

export type Mats = ReturnType<typeof createMaterials>;
