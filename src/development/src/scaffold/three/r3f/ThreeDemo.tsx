import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";

function SpinningBox() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Box ref={meshRef} args={[1, 1, 1]}>
      <meshStandardMaterial color="royalblue" />
    </Box>
  );
}

function Scene() {
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <SpinningBox />
      <OrbitControls />
    </group>
  );
}

export default function ThreeDemo() {
  return (
    <div>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <Scene />
      </Canvas>
    </div>
  );
}
