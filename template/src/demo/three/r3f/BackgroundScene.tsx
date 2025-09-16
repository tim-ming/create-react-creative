import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import { OrbitControls, Box, useCursor } from '@react-three/drei';
import * as THREE from 'three';

function Rig({
  initialPosition = [0, 0, 0],
  radius = 5,
  speed = 10,
}: {
  initialPosition?: THREE.Vector3Tuple;
  radius?: number;
  speed?: number;
}) {
  const { camera, pointer } = useThree();
  const azimuthRef = useRef(0); // horizontal angle
  const elevationRef = useRef(0); // vertical angle

  useFrame((_, delta) => {
    // Map pointer.x (-1 → 1) → horizontal angle (±60°)
    const targetAzimuth = pointer.x * (Math.PI / 3);

    // Map pointer.y (-1 → 1) → vertical angle (±60°)
    const targetElevation = pointer.y * (Math.PI / 3);

    // Smoothly lerp both angles
    azimuthRef.current = THREE.MathUtils.lerp(azimuthRef.current, targetAzimuth, delta * speed);
    elevationRef.current = THREE.MathUtils.lerp(elevationRef.current, targetElevation, delta * speed);

    // Convert spherical coordinates → Cartesian
    const x = initialPosition[0] + radius * Math.cos(elevationRef.current) * Math.cos(azimuthRef.current);
    const y = initialPosition[1] + radius * Math.sin(elevationRef.current);
    const z = initialPosition[2] + radius * Math.cos(elevationRef.current) * Math.sin(azimuthRef.current);

    camera.position.set(x, y, z);
    camera.lookAt(...initialPosition);
  });

  return null;
}

function SpinningBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered /*'pointer', 'auto', document.body*/);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Box
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      ref={meshRef}
      args={[1, 1, 1]}
    >
      <meshStandardMaterial color={hovered ? 'mediumpurple' : 'royalblue'} />
    </Box>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <SpinningBox />
      <OrbitControls enableZoom={false} />
    </>
  );
}

export default function BackgroundScene() {
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
    <Canvas onCreated={onCreated}>
      <Scene />
      <color attach="background" args={['#eee']} />
      <Rig />
    </Canvas>
  );
}
