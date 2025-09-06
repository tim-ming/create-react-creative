import type { LenisOptions } from 'lenis';
import { ReactLenis } from 'lenis/react';

// https://github.com/darkroomengineering/lenis/tree/main/packages/react
export default function Lenis() {
  const options: LenisOptions = {
    smoothWheel: true,
    touchMultiplier: 0, // disable on mobile
  };
  return <ReactLenis root options={options} />;
}
