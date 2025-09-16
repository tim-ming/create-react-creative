import React from 'react';
import { useSpring, animated } from '@react-spring/web';

// Minimal: animate whole lines (no char/word splitting) with react-spring

type LineProps = {
  children: React.ReactNode;
  delay?: number;
  reduce: boolean;
};

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefers(media.matches);
    handler();
    media.addEventListener('change', handler);
    return () => {
      media.removeEventListener('change', handler);
    };
  }, []);
  return prefers;
}

const Line = ({ children, delay = 0, reduce }: LineProps) => {
  const springs = useSpring(
    reduce
      ? {
          from: { opacity: 0 },
          to: { opacity: 1 },
          delay,
          config: { duration: 200 },
        }
      : {
          from: { transform: 'translateY(100%)', opacity: 0 },
          to: { transform: 'translateY(0%)', opacity: 1 },
          delay,
          config: { tension: 140, friction: 24 },
        }
  );

  return (
    <span className="block overflow-hidden">
      <animated.span className="inline-block will-change-transform" style={springs}>
        {children}
      </animated.span>
    </span>
  );
};

export default function Title() {
  const reduce = usePrefersReducedMotion();

  return (
    <div>
      <h1 className="text-center text-4xl font-medium tracking-tight whitespace-nowrap sm:text-5xl lg:text-6xl xl:text-7xl">
        <Line reduce={Boolean(reduce)} delay={0}>
          React Creative Starter
        </Line>
      </h1>

      <div className="mt-4">
        <p className="text-center text-sm text-gray-500 md:text-base">
          <Line reduce={Boolean(reduce)} delay={200}>
            Edit <code>src/App.tsx</code> to get started.
          </Line>
        </p>
      </div>
    </div>
  );
}
