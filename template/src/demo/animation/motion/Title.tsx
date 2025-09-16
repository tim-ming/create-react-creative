import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

// There is a SplitText plugin for motion+ users. https://motion.dev/docs/split-text
// This only animates lines, not characters or words like the GSAP demo.
type LineProps = {
  children: React.ReactNode;
  delay?: number;
  reduce: boolean;
};

const Line = ({ children, delay = 0, reduce }: LineProps) => (
  <span className="block overflow-hidden">
    <motion.span
      className="inline-block will-change-transform"
      initial={reduce ? { opacity: 0 } : { y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: reduce ? 0.2 : 0.8,
        ease: reduce ? undefined : [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.span>
  </span>
);

export default function Title() {
  const reduce = useReducedMotion();

  return (
    <div>
      <h1 className="text-center text-4xl font-medium tracking-tight whitespace-nowrap sm:text-5xl lg:text-6xl xl:text-7xl">
        <Line reduce={Boolean(reduce)} delay={0}>
          React Creative Starter
        </Line>
      </h1>

      <div className="mt-4">
        <p className="text-center text-sm text-gray-500 md:text-base">
          <Line reduce={Boolean(reduce)} delay={0.1}>
            Edit <code>src/App.tsx</code> to get started.
          </Line>
        </p>
      </div>
    </div>
  );
}
