import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

/**
 * Iridescent spiral of thin discs ("chips") inspired by the reference image.
 * - Uses an InstancedMesh of thin cylinders
 * - Places them along a torus path and applies a progressive roll to create a swirl
 * - MeshPhysicalMaterial with iridescence for the oil-slick/pearlescent sheen
 * - Mild bloom + chromatic aberration + vignette for a cinematic look
 *
 * Controls:
 * - Hover/drag with OrbitControls
 * - Tweak COUNT, radii, and twist to match your taste
 */

function SpiralChips({
  COUNT = 20,
  majorRadius = 2.2, // torus major radius
  minorRadius = 1.2, // torus minor radius (controls thickness of the ring)
  discRadius = 0.75,
  discThickness = 0.04,
}: {
  COUNT?: number;
  majorRadius?: number;
  minorRadius?: number;
  discRadius?: number;
  discThickness?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const upY = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
  const tmpQuat2 = useMemo(() => new THREE.Quaternion(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Reusable geometries/materials
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(discRadius, discRadius, discThickness, 96, 1),
    [discRadius, discThickness]
  );

  // We'll use MeshPhysicalMaterial to access iridescence for the slick look
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#aaa'),
        metalness: 0.2,
        roughness: 1,
        emissive: new THREE.Color('#888'),
        // iridescence: 0.9,
        // iridescenceIOR: 1.3,
        // iridescenceThicknessRange: [100, 600],
        side: THREE.DoubleSide,
      }),
    []
  );

  // Precompute per-instance colors (soft gradient around the loop)
  const colors = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      // Interpolate hue between blue (0.6) and purple (0.8)
      const hue = 0.55 + (0.8 - 0.55) * t;
      color.setHSL(hue, 1, 0.6).toArray(arr, i * 3);
    }
    return arr;
  }, [COUNT, color]);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < COUNT; i++) {
      const u = (i / COUNT) * Math.PI * 2; // angle around major radius

      // Torus center position for this segment
      const cx = Math.cos(u) * majorRadius;
      const cy = Math.sin(u) * majorRadius;

      // Offset outward along torus tube normal so discs don't intersect the origin
      const ox = Math.cos(u) * minorRadius * 0.25;
      const oy = Math.sin(u) * minorRadius * 0.25;

      const px = cx + ox;
      const py = cy + oy;
      const pz = 0;

      // Outward normal from origin (faces away from center)
      normal.set(px, py, pz).normalize();

      // Align disc's Y axis with the outward normal
      tmpQuat.setFromUnitVectors(upY, normal);

      // Roll around its normal progressively to produce the fan-like swirl
      const rotation = new THREE.Euler(0, 0, Math.PI / 2);
      tmpQuat2.setFromEuler(rotation);
      tmpQuat.multiply(tmpQuat2);

      dummy.position.set(px, py, pz);
      dummy.quaternion.copy(tmpQuat);
      // Slight non-uniform scale to make discs feel shingled
      // const s = 1.0 + 0.15 * Math.sin(u * 2.0);
      // dummy.scale.set(s, 1, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Apply per-instance color (affects material color multiplier)
      color.fromArray(colors, i * 3);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [COUNT, majorRadius, minorRadius, colors, upY, tmpQuat, tmpQuat2, normal, color, dummy]);

  // Gentle breathing animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!meshRef.current) return;
    const rot = t * 0.02;
    meshRef.current.rotation.z = rot; // subtle overall swirl
  });

  return (
    <group position={[-0.5, 0, 0]} rotation={[-0.5, -0.8, 0]}>
      {/* Rim (curved side) as instanced cylinders */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <primitive object={geometry} attach="geometry" />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </group>
  );
}

function Rig({ initialPosition = new THREE.Vector3(0, 0, 0) }: { initialPosition?: THREE.Vector3 }) {
  const { camera, pointer } = useThree();
  const pos = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z);

  return useFrame(() => {
    const scrollPosition = window.scrollY;

    camera.position.lerp(
      pos.set(
        initialPosition.x + pointer.x * 0.2,
        initialPosition.y + pointer.y * 0.2,
        initialPosition.z + scrollPosition * 0.002
      ),
      0.05
    );
  });
}
export default function IridescentSpiralScene() {
  // const { focusDistance, focusRange, bokehScale, focalLength } = useControls('Depth of Field', {
  //   focusDistance: { value: 0.1, min: 0, max: 1, step: 0.01 },
  //   focusRange: { value: 0.1, min: 0, max: 1, step: 0.01 },
  //   bokehScale: { value: 2, min: 0, max: 10, step: 0.1 },
  //   focalLength: { value: 0.1, min: 0, max: 1, step: 0.01 },
  // });
  const onCreated = (state: RootState) => {
    const canvas = state.gl.domElement;
    const container = document.getElementById('root');

    if (state.events.connect && container) {
      state.events.connect(container);
      state.setEvents({
        compute: (event, state) => {
          const rect = canvas.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

          if (!inside) return; // skip if cursor not inside canvas

          state.pointer.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
          );
          state.raycaster.setFromCamera(state.pointer, state.camera);
        },
      });
    }
  };

  return (
    <div className="h-full min-h-[600px] w-full bg-[#DDDDEE]">
      <Canvas
        onCreated={onCreated}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], far: 20, near: 0.1, fov: 90 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#dde']} />
        <Rig initialPosition={new THREE.Vector3(0, 0, 6)} />
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, -100, 10]} intensity={5} />
        <directionalLight intensity={1} />
        {/* <pointLight position={[0, 0, 10]} intensity={1} decay={0} /> */}

        {/* Environment for nice reflections */}
        <Environment preset="studio" environmentIntensity={1} />

        <SpiralChips />
        {/* <fog attach="fog" args={['#ccc', 0.1, 10]} /> */}
        {/* Postprocessing */}
        <EffectComposer resolutionScale={0.5}>
          <Bloom intensity={2} mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} />
          {/* <DepthOfField focusDistance={0.12} focalLength={0.29} bokehScale={10} /> */}
        </EffectComposer>
      </Canvas>
      {/* <Leva /> */}
    </div>
  );
}
