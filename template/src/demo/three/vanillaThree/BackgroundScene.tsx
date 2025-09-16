// BackgroundScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Vec3Tuple = [number, number, number];

type BackgroundSceneProps = {
  initialPosition?: Vec3Tuple; // orbit target
  radius?: number; // camera distance from target
  speed?: number; // lerp speed for pointer-follow
  background?: string; // background color
};

export default function BackgroundScene({
  initialPosition = [0, 0, 0],
  radius = 5,
  speed = 10,
  background = '#eeeeee',
}: BackgroundSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene / Renderer / Camera ---
    const container = containerRef.current;
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(background);
    container.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    scene.add(camera);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(10, 10, 5);
    scene.add(dir);

    // --- Spinning, hoverable box ---
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshStandardMaterial({ color: 'royalblue' });
    const box = new THREE.Mesh(boxGeo, boxMat);
    scene.add(box);

    // --- Controls (optional; disabled zoom) ---
    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enableDamping = true;

    // --- Rig (pointer-driven orbital camera) ---
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let insideCanvas = false;
    let hovered = false;
    let dragging = false;

    // start camera at azimuth=0, elevation=0
    let azimuth = 0;
    let elevation = 0;
    const [cx, cy, cz] = initialPosition;

    function positionCameraFromAngles() {
      const x = cx + radius * Math.cos(elevation) * Math.cos(azimuth);
      const y = cy + radius * Math.sin(elevation);
      const z = cz + radius * Math.cos(elevation) * Math.sin(azimuth);
      camera.position.set(x, y, z);
      camera.lookAt(cx, cy, cz);
      controls.target.set(cx, cy, cz);
    }
    positionCameraFromAngles();

    // --- Pointer handlers ---
    const updatePointer = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const { clientX: x, clientY: y } = event;
      insideCanvas = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (!insideCanvas) return;

      pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = () => {
      dragging = true;
      canvas.style.cursor = 'grabbing';
    };
    const onPointerUp = () => {
      dragging = false;
      // if still hovering the box, keep pointer, else reset to auto
      canvas.style.cursor = hovered ? 'pointer' : 'auto';
    };

    window.addEventListener('mousemove', updatePointer);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // --- Resize ---
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // --- Render loop ---
    let prev = performance.now();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - prev) / 1000, 0.1); // clamp big tab-jumps
      prev = now;

      // Spin the box
      box.rotation.y += 0.01;

      // Raycast to toggle hover state
      if (insideCanvas) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(box, false);
        if (hits.length > 0 && !hovered) {
          hovered = true;
          (box.material as THREE.MeshStandardMaterial).color.set('mediumpurple');
          canvas.style.cursor = dragging ? 'grabbing' : 'pointer';
        } else if (hits.length === 0 && hovered) {
          hovered = false;
          (box.material as THREE.MeshStandardMaterial).color.set('royalblue');
          canvas.style.cursor = 'auto';
        }
      }

      // Rig: map pointer to target azimuth/elevation (±60°) and lerp
      const tAzimuth = pointer.x * (Math.PI / 3);
      const tElevation = pointer.y * (Math.PI / 3);
      azimuth = THREE.MathUtils.lerp(azimuth, tAzimuth, delta * speed);
      elevation = THREE.MathUtils.lerp(elevation, tElevation, delta * speed);

      // If user is dragging, let OrbitControls drive. Otherwise apply Rig.
      if (!dragging) {
        positionCameraFromAngles();
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', updatePointer);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      controls.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [background, initialPosition, radius, speed]);

  // Fill parent; set a height in your layout or here.
  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
}
