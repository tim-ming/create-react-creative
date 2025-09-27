// components/AnimatedTerminals.tsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(useGSAP, TextPlugin);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/* =========================
   AnimatedSpan (GSAP)
   ========================= */
type AnimatedSpanProps = {
  children: React.ReactNode;
  delay?: number; // ms
  className?: string;
  y?: number; // px, start offset
  duration?: number; // seconds
};

export function AnimatedSpan({ children, delay = 0, className, y = -5, duration = 0.3 }: AnimatedSpanProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y }, { opacity: 1, y: 0, duration, delay: delay / 1000 });
  }, [delay, y, duration]);

  return (
    <div ref={ref} className={cn('grid font-normal tracking-tight', className)}>
      {children}
    </div>
  );
}

/* =========================
   TypingAnimation (GSAP-driven)
   - types text over time (duration = ms per char)
   ========================= */

export function TypingAnimation({
  children,
  className,
  duration = 60,
  delay = 0,
  ...rest
}: {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  if (typeof children !== 'string') {
    throw new Error('TypingAnimation: children must be a string.');
  }

  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const element = ref.current;
      const totalSeconds = (children.length * duration) / 1000;

      const timeline = gsap.timeline({ delay: delay / 1000 });

      timeline.set(element, { text: '' });

      timeline.fromTo(element, { opacity: 0, y: -5 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });

      timeline.to(
        element,
        {
          text: { value: children, delimiter: '' },
          duration: totalSeconds,
          ease: 'none',
        },
        '<'
      );
    },
    { dependencies: [children, duration, delay], scope: ref }
  );

  return (
    <span ref={ref} className={cn('font-normal tracking-tight', className)} suppressHydrationWarning {...rest}>
      {/* intentionally empty, GSAP fills it */}
    </span>
  );
}

/* =========================
   Terminal (UI only)
   ========================= */
type TerminalProps = {
  children: React.ReactNode;
  className?: string;
};

export function Terminal({ children, className }: TerminalProps) {
  return (
    <div className={cn('bg-background z-0 flex w-full flex-col overflow-hidden rounded-xl border', className)}>
      <div className="flex items-center gap-x-2 p-6">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <pre className="flex-1 overflow-hidden px-6 pt-0 pb-6">
        <code className="grid overflow-y-auto">{children}</code>
      </pre>
    </div>
  );
}
