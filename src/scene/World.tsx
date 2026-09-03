import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMats, useTex } from "@/scene/assets";
import { easeInOut, lerp, lerp3, remap } from "@/scene/chapters";
import { hash } from "@/scene/hash";
import { C } from "@/scene/theme";
import { useReel } from "@/store/reel";

const DUMMY = new THREE.Object3D();

export function World() {
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 18, 86]} />
      <hemisphereLight args={[C.ice, "#071018", 0.62]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[7, 11, 9]} intensity={1.18} color={C.ice} />
      <directionalLight position={[-8, 4, -4]} intensity={0.42} color={C.cube} />
      <pointLight position={[0, 3.2, 4]} intensity={1.1} distance={16} color={C.cyan} />
      <pointLight position={[0, 2.4, 0.3]} intensity={1.7} distance={9} color={C.gold} />
      <pointLight position={[0, 2.1, -18.2]} intensity={1.25} distance={11} color={C.cyan} />
      <pointLight position={[2.7, 1.6, -32]} intensity={0.9} distance={8} color={C.cyan} />
      <pointLight position={[0, 2.2, -50]} intensity={1.5} distance={12} color={C.gold} />
      <pointLight position={[0, 2.1, -62]} intensity={1.1} distance={10} color={C.gold} />
      <pointLight position={[0, 2.4, -74]} intensity={1.35} distance={11} color={C.orange} />
      <LineGrid />
      <CubeField />
      <CoreBoard />
      <Spectacle />
      <Handset />
      <Hall />
    </>
  );
}

function LineGrid() {
  const mat = useMats().wire;
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => {
    const pos: number[] = [];
    const n = 7;
    const s = 2.35;
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        pos.push(-n * s, i * s * 0.38, j * s, n * s, i * s * 0.38, j * s);
        pos.push(i * s, j * s * 0.38, -n * s, i * s, j * s * 0.38, n * s);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame(() => {
    const t = useReel.getState().time;
    const m = ref.current;
    if (!m) return;
    const fade = 1 - remap(t, 4.6, 6.4);
    (m.material as THREE.LineBasicMaterial).opacity = 0.26 * fade;
    m.visible = fade > 0.02;
  });

  return (
    <lineSegments ref={ref} geometry={geo} material={mat} position={[0, 1.1, 3.2]} />
  );
}

function CubeField() {
  const { cube, glass } = useMats();
  return (
    <>
      <InstancedCubes material={cube} count={72} seed={2} idle />
      <InstancedCubes material={glass} count={36} seed={19} idle scaleMul={1.35} />
    </>
  );
}

function InstancedCubes({
  material,
  count,
  seed,
  idle = false,
  scaleMul = 1,
}: {
  material: THREE.Material;
  count: number;
  seed: number;
  idle?: boolean;
  scaleMul?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const base = useMemo(() => {
    const out: { p: THREE.Vector3; s: number; r: THREE.Euler }[] = [];
    for (let i = 0; i < count; i++) {
      const h1 = hash(i + seed);
      const h2 = hash(i + seed + 17);
      const h3 = hash(i + seed + 41);
      out.push({
        p: new THREE.Vector3((h1 - 0.5) * 16, (h2 - 0.15) * 9, (h3 - 0.25) * 20),
        s: (0.28 + hash(i + seed + 7) * 1.25) * scaleMul,
        r: new THREE.Euler(h1 * 0.4, h2 * 0.6, h3 * 0.3),
      });
    }
    return out;
  }, [count, seed, scaleMul]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    base.forEach((b, i) => {
      DUMMY.position.copy(b.p);
      DUMMY.scale.setScalar(b.s);
      DUMMY.rotation.copy(b.r);
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [base]);

  useFrame(() => {
    if (!idle) return;
    const mesh = ref.current;
    if (!mesh) return;
    const t = useReel.getState().idle;
    base.forEach((b, i) => {
      DUMMY.position.copy(b.p);
      DUMMY.position.y += Math.sin(t * 0.7 + i * 0.37) * 0.16;
      DUMMY.scale.setScalar(b.s);
      DUMMY.rotation.copy(b.r);
      DUMMY.rotation.y += t * 0.08;
      DUMMY.updateMatrix();
      mesh.setMatrixAt(i, DUMMY.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={material} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

const CHIP_KF = [
  { t: 0.0, p: [2.5, 2.7, 5.6] as [number, number, number], r: [1.18, 0.58, 0.38] as [number, number, number] },
  { t: 1.55, p: [1.15, 1.95, 2.7] as [number, number, number], r: [0.52, -0.48, 0.16] as [number, number, number] },
  { t: 3.05, p: [0.18, 1.18, 0.58] as [number, number, number], r: [0.2, 0.1, 0] as [number, number, number] },
  { t: 4.55, p: [0, 0.5, 0] as [number, number, number], r: [0, 0, 0] as [number, number, number] },
  { t: 5.5, p: [0, 0.38, 0] as [number, number, number], r: [0, 0, 0] as [number, number, number] },
];

function sampleChip(t: number) {
  let i = 0;
  while (i < CHIP_KF.length - 2 && CHIP_KF[i + 1]!.t <= t) i += 1;
  const a = CHIP_KF[i]!;
  const b = CHIP_KF[i + 1]!;
  const u = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
  const s = easeInOut(Math.min(1, Math.max(0, u)));
  return { p: lerp3(a.p, b.p, s), r: lerp3(a.r, b.r, s) };
}

function CoreBoard() {
  const mats = useMats();
  const tex = useTex();
  const chip = useRef<THREE.Group>(null);
  const markMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: tex.mark,
      emissiveMap: tex.mark,
      emissive: new THREE.Color("#e8f4fc"),
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.2,
    });
    return m;
  }, [tex.mark]);
  const pcbMat = useMemo(() => {
    const m = mats.pcb.clone();
    m.map = tex.pcb;
    return m;
  }, [mats.pcb, tex.pcb]);
  const pinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.pin, roughness: 0.5, metalness: 0.4 }),
    [tex.pin],
  );

  useFrame(() => {
    const t = useReel.getState().time;
    const node = chip.current;
    if (!node) return;
    const { p, r } = sampleChip(t);
    node.position.set(p[0], p[1], p[2]);
    node.rotation.set(r[0], r[1], r[2]);
    const lit = easeInOut(remap(t, 4.15, 5.35));
    markMat.emissiveIntensity = 0.2 + lit * 1.9;
  });

  const smd = useMemo(() => {
    const items: { p: [number, number, number]; s: [number, number, number] }[] = [];
    for (let i = 0; i < 28; i++) {
      const h1 = hash(i + 90);
      const h2 = hash(i + 140);
      const x = (h1 - 0.5) * 5.6;
      const z = (h2 - 0.5) * 5.6;
      if (Math.abs(x) < 1.15 && Math.abs(z) < 1.15) continue;
      items.push({
        p: [x, 0.12, z],
        s: [0.18 + hash(i) * 0.28, 0.1, 0.12 + hash(i + 3) * 0.22],
      });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={pcbMat}>
        <planeGeometry args={[7.2, 7.2]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={mats.navyDeep}>
        <boxGeometry args={[7.2, 0.1, 7.2]} />
      </mesh>
      <mesh position={[0, 0.16, 0]} material={mats.silver2}>
        <boxGeometry args={[1.95, 0.14, 1.95]} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} material={pinMat}>
        <planeGeometry args={[1.62, 1.62]} />
      </mesh>
      {smd.map((it, i) => (
        <mesh key={i} position={it.p} scale={it.s} material={i % 4 === 0 ? mats.black : mats.navy}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
      {[
        [-2.4, -1.8],
        [2.2, -2.1],
        [-2.1, 2.3],
        [2.5, 1.7],
      ].map((p, i) => (
        <mesh key={`cap-${i}`} position={[p[0]!, 0.22, p[1]!]} material={mats.black}>
          <cylinderGeometry args={[0.14, 0.14, 0.28, 12]} />
        </mesh>
      ))}
      <group ref={chip}>
        <mesh material={mats.gold} position={[0, -0.02, 0]}>
          <boxGeometry args={[1.68, 0.05, 1.68]} />
        </mesh>
        <mesh material={mats.silver}>
          <boxGeometry args={[1.58, 0.22, 1.58]} />
        </mesh>
        <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markMat}>
          <planeGeometry args={[1.12, 1.12]} />
        </mesh>
        <mesh position={[0, -0.116, 0]} rotation={[Math.PI / 2, 0, 0]} material={pinMat}>
          <planeGeometry args={[1.48, 1.48]} />
        </mesh>
        {[-0.18, 0, 0.18].map((x) => (
          <mesh key={x} position={[x, 0.12, 0.62]} material={mats.gold}>
            <boxGeometry args={[0.06, 0.02, 0.06]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Spectacle() {
  const mats = useMats();
  const tex = useTex();
  const wheelG = useRef<THREE.Group>(null);
  const clockG = useRef<THREE.Group>(null);
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);

  const wheelTop = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.wheel, roughness: 0.45, metalness: 0.25 }),
    [tex.wheel],
  );
  const clockFace = useMemo(
    () => new THREE.MeshBasicMaterial({ map: tex.clock }),
    [tex.clock],
  );

  useFrame(() => {
    const { time: t, idle } = useReel.getState();
    if (wheelG.current) {
      const show = 1 - remap(t, 7.9, 8.45);
      wheelG.current.visible = show > 0.02;
      wheelG.current.rotation.y = idle * 1.35;
      wheelG.current.rotation.x = lerp(0.18, 0.5, easeInOut(remap(t, 7.5, 8.4)));
      wheelG.current.scale.setScalar(0.75 + show * 0.25);
    }
    if (ball.current) {
      const a = idle * 2.6;
      ball.current.position.set(Math.cos(a) * 1.08, 0.18, Math.sin(a) * 1.08);
    }
    if (clockG.current) {
      const show = remap(t, 8.15, 8.7);
      clockG.current.visible = show > 0.02 && t < 11.6;
      clockG.current.scale.setScalar(1.45 + show * 0.55);
      clockG.current.rotation.x = 0.4;
    }
    const spin = idle * 2.4;
    if (hour.current) hour.current.rotation.z = -spin * 0.12;
    if (minute.current) minute.current.rotation.z = -spin * 0.7;
    if (second.current) second.current.rotation.z = -spin * 4.2;
  });

  return (
    <group position={[0, 0.42, -18.3]}>
      <group ref={wheelG}>
        <mesh material={mats.navy}>
          <cylinderGeometry args={[1.38, 1.42, 0.28, 48]} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} material={wheelTop}>
          <circleGeometry args={[1.34, 64]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]} material={mats.gold}>
          <torusGeometry args={[1.36, 0.045, 8, 64]} />
        </mesh>
        <mesh material={mats.gold}>
          <cylinderGeometry args={[0.07, 0.07, 0.52, 12]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={mats.gold}>
          <sphereGeometry args={[0.11, 16, 12]} />
        </mesh>
        <mesh ref={ball} material={mats.ice}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
      </group>

      <group ref={clockG}>
        <mesh material={mats.navyDeep} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.38, 1.38, 0.18, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.1]} material={clockFace}>
          <circleGeometry args={[1.28, 64]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]} material={mats.gold}>
          <torusGeometry args={[1.34, 0.05, 8, 64]} />
        </mesh>
        <mesh position={[0, 0, 0.12]} material={mats.gold}>
          <sphereGeometry args={[0.06, 12, 12]} />
        </mesh>
        <group ref={hour} position={[0, 0, 0.13]}>
          <mesh position={[0, 0.22, 0]} material={mats.gold}>
            <boxGeometry args={[0.065, 0.44, 0.03]} />
          </mesh>
        </group>
        <group ref={minute} position={[0, 0, 0.14]}>
          <mesh position={[0, 0.32, 0]} material={mats.gold}>
            <boxGeometry args={[0.045, 0.64, 0.025]} />
          </mesh>
        </group>
        <group ref={second} position={[0, 0, 0.15]}>
          <mesh position={[0, 0.4, 0]} material={mats.ice}>
            <boxGeometry args={[0.02, 0.8, 0.02]} />
          </mesh>
        </group>
        <mesh position={[0, 1.42, 0]} material={mats.silver2}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
        </mesh>
      </group>
    </group>
  );
}

function Handset() {
  const mats = useMats();
  const tex = useTex();
  const g = useRef<THREE.Group>(null);
  const screen = useMemo(
    () => new THREE.MeshBasicMaterial({ map: tex.phone }),
    [tex.phone],
  );

  useFrame(() => {
    const { time: t, idle } = useReel.getState();
    const node = g.current;
    if (!node) return;
    node.position.y = 0.58 + Math.sin(idle * 0.85) * 0.07;
    node.rotation.y = -0.38 + Math.sin(idle * 0.45) * 0.1;
    node.rotation.x = 0.22;
    node.rotation.z = 0.06;
    const vis = remap(t, 10.8, 11.4) * (1 - remap(t, 14.15, 14.7));
    node.visible = vis > 0.02;
  });

  return (
    <group ref={g} position={[2.72, 0.58, -32.45]} scale={2.3}>
      <mesh material={mats.black}>
        <boxGeometry args={[0.78, 1.58, 0.09]} />
      </mesh>
      <mesh material={mats.silver2} position={[0, 0, -0.01]}>
        <boxGeometry args={[0.8, 1.6, 0.03]} />
      </mesh>
      <mesh position={[0, 0, 0.05]} material={screen}>
        <planeGeometry args={[0.7, 1.46]} />
      </mesh>
    </group>
  );
}

function Hall() {
  const mats = useMats();
  return (
    <>
      <CorridorBoxes />
      <Slabs />
      <Pie />
      <CrewGear />
      <Terminal />
      <mesh position={[-3.4, 1.1, -42]} material={mats.glass}>
        <boxGeometry args={[1.6, 2.2, 1.6]} />
      </mesh>
      <mesh position={[3.6, 1.4, -58]} material={mats.glass}>
        <boxGeometry args={[1.4, 2.6, 1.4]} />
      </mesh>
    </>
  );
}

function CorridorBoxes() {
  const { navy, orange } = useMats();
  const refN = useRef<THREE.InstancedMesh>(null);
  const refO = useRef<THREE.InstancedMesh>(null);
  const nCount = 56;
  const oCount = 18;

  useLayoutEffect(() => {
    const n = refN.current;
    const o = refO.current;
    if (!n || !o) return;
    let ni = 0;
    let oi = 0;
    for (let i = 0; i < 28; i++) {
      const z = -36.5 - i * 1.55;
      const h = 1.1 + hash(i + 4) * 1.8;
      const side = i % 2 === 0 ? -1 : 1;
      DUMMY.position.set(side * (2.15 + hash(i) * 0.35), h * 0.5, z);
      DUMMY.scale.set(1.35 + hash(i + 2) * 0.5, h, 1.2 + hash(i + 5) * 0.4);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.updateMatrix();
      if (i % 5 === 2 && oi < oCount) {
        o.setMatrixAt(oi, DUMMY.matrix);
        oi += 1;
      } else if (ni < nCount) {
        n.setMatrixAt(ni, DUMMY.matrix);
        ni += 1;
      }
      DUMMY.position.set(-side * (2.35 + hash(i + 9) * 0.4), 2.4 + hash(i + 11) * 0.8, z - 0.4);
      DUMMY.scale.set(1.1, 0.55 + hash(i + 13) * 0.7, 1.4);
      DUMMY.updateMatrix();
      if (ni < nCount) {
        n.setMatrixAt(ni, DUMMY.matrix);
        ni += 1;
      }
    }
    while (ni < nCount) {
      DUMMY.position.set(0, -4, 0);
      DUMMY.scale.setScalar(0.01);
      DUMMY.updateMatrix();
      n.setMatrixAt(ni, DUMMY.matrix);
      ni += 1;
    }
    while (oi < oCount) {
      DUMMY.position.set(0, -4, 0);
      DUMMY.scale.setScalar(0.01);
      DUMMY.updateMatrix();
      o.setMatrixAt(oi, DUMMY.matrix);
      oi += 1;
    }
    n.instanceMatrix.needsUpdate = true;
    o.instanceMatrix.needsUpdate = true;
    n.computeBoundingSphere();
    o.computeBoundingSphere();
  }, [nCount, oCount]);

  return (
    <>
      <instancedMesh ref={refN} args={[undefined, undefined, nCount]} material={navy} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={refO} args={[undefined, undefined, oCount]} material={orange} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </>
  );
}

function Slabs() {
  const mats = useMats();
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 26;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < count; i++) {
      DUMMY.position.set(0, 0.02, -36.2 - i * 1.55);
      DUMMY.scale.set(2.5, 0.12, 1.35);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.updateMatrix();
      m.setMatrixAt(i, DUMMY.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [count]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mats.navyDeep} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function Pie() {
  const mats = useMats();
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const { time: t, idle } = useReel.getState();
    const node = g.current;
    if (!node) return;
    const show = remap(t, 13.9, 14.6) * (1 - remap(t, 16.35, 16.85));
    node.visible = show > 0.02;
    const grow = easeInOut(remap(t, 15.5, 16.55));
    node.scale.setScalar(1.75 + grow * 1.05);
    node.rotation.y = idle * 0.55;
    node.rotation.z = 0.22;
  });
  const slices = [
    { start: 0.08, len: 1.85, mat: mats.gold },
    { start: 2.05, len: 1.15, mat: mats.cream },
    { start: 3.32, len: 2.8, mat: mats.orange },
  ];
  return (
    <group ref={g} position={[0, 1.34, -48.9]}>
      {slices.map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} material={s.mat}>
          <cylinderGeometry args={[1.15, 1.15, 0.28, 32, 1, false, s.start, s.len]} />
        </mesh>
      ))}
    </group>
  );
}

function makeGearShape() {
  const shape = new THREE.Shape();
  const teeth = 12;
  const outer = 1.12;
  const inner = 0.78;
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const tooth = i % 4 < 2;
    const r = tooth ? outer : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.34, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function CrewGear() {
  const mats = useMats();
  const tex = useTex();
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    const shape = makeGearShape();
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 1,
    });
    extrude.center();
    return extrude;
  }, []);
  const people = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: tex.people,
        transparent: true,
      }),
    [tex.people],
  );

  useFrame(() => {
    const { time: t, idle } = useReel.getState();
    const node = g.current;
    if (!node) return;
    const show = remap(t, 16.15, 16.7) * (1 - remap(t, 18.15, 18.65));
    node.visible = show > 0.02;
    node.rotation.z = idle * 0.7;
    node.scale.setScalar(1.25 + show * 0.2);
  });

  return (
    <group ref={g} position={[0, 1.28, -59.2]}>
      <mesh geometry={geo} material={mats.silver} />
      <mesh position={[0, 0, 0.14]} material={mats.gold}>
        <circleGeometry args={[0.42, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.16]} material={people}>
        <planeGeometry args={[0.55, 0.55]} />
      </mesh>
    </group>
  );
}

function Terminal() {
  const mats = useMats();
  const tex = useTex();
  const g = useRef<THREE.Group>(null);
  const marquee = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.marquee }), [tex.marquee]);
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.kiosk }), [tex.kiosk]);

  useFrame(() => {
    const t = useReel.getState().time;
    const node = g.current;
    if (!node) return;
    node.visible = t > 16.8;
  });

  return (
    <group ref={g} position={[0, 0, -72.8]} scale={1.55}>
      <mesh position={[0, 0.55, 0.05]} material={mats.navyDeep}>
        <boxGeometry args={[1.55, 1.1, 0.72]} />
      </mesh>
      <mesh position={[0, 1.14, 0.12]} material={mats.navy}>
        <boxGeometry args={[1.62, 0.08, 0.88]} />
      </mesh>
      <mesh position={[0, 1.62, 0.18]} rotation={[-0.28, 0, 0]} material={mats.black}>
        <boxGeometry args={[1.42, 0.82, 0.08]} />
      </mesh>
      <mesh position={[0, 1.62, 0.23]} rotation={[-0.28, 0, 0]} material={screen}>
        <planeGeometry args={[1.32, 0.72]} />
      </mesh>
      <mesh position={[0, 2.28, 0.12]} material={mats.black}>
        <boxGeometry args={[1.5, 0.72, 0.08]} />
      </mesh>
      <mesh position={[0, 2.28, 0.17]} material={marquee}>
        <planeGeometry args={[1.4, 0.62]} />
      </mesh>
      {[-0.42, 0, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.42, 0.38]} material={mats.silver2}>
          <boxGeometry args={[0.28, 0.18, 0.06]} />
        </mesh>
      ))}
      <mesh position={[-0.55, 0.55, 0.4]} material={mats.gold}>
        <boxGeometry args={[0.12, 0.22, 0.04]} />
      </mesh>
    </group>
  );
}
