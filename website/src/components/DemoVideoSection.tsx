import { useRef, type JSX } from 'react';
import { Terminal, AnimatedSpan, TypingAnimation } from '@/components/Terminal';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type TerminalLine = {
  kind: 'span' | 'typing';
  text: string;
  duration?: number; // ms per character for typing effect
  gap?: number; // ms pause after rendering the line
  className?: string; // optional Tailwind class for styling
};

const terminalScript: TerminalLine[] = [
  { kind: 'typing', text: '> npm create react-creative@latest', duration: 30, gap: 400, className: 'text-blue-400' },

  { kind: 'span', text: 'Create your creative project ⚡', className: 'text-emerald-400' },

  { kind: 'span', text: 'Project name:', className: 'ml-[2ch] text-slate-400' },
  { kind: 'span', text: 'react-creative', className: 'ml-[4ch] mb-4 text-slate-200' },

  { kind: 'span', text: 'Choose an animation library:', className: 'ml-[2ch] text-slate-400' },
  { kind: 'span', text: 'GSAP', className: 'ml-[4ch] mb-4 text-slate-200' },

  { kind: 'span', text: 'Choose a state management library:', className: 'ml-[2ch] text-slate-400' },
  { kind: 'span', text: 'Zustand', className: 'ml-[4ch] mb-4 text-slate-200' },

  { kind: 'span', text: 'Add 3D graphics library?', className: 'ml-[2ch] text-slate-400' },
  { kind: 'span', text: 'react-three-fiber', className: 'ml-[4ch] mb-4 text-slate-200' },

  { kind: 'span', text: 'Add React Three helpers?', className: 'ml-[2ch] text-slate-400' },
  {
    kind: 'span',
    text: 'react-three-postprocessing',
    className: 'ml-[4ch] mb-4 text-slate-200',
  },

  { kind: 'span', text: 'Add creative coding helpers?', gap: 400, className: 'ml-[2ch] text-slate-400' },
  { kind: 'span', text: 'lenis', duration: 30, className: 'ml-[4ch] mb-4 text-slate-200' },

  {
    kind: 'span',
    text: 'Scaffolding project in /Users/name/react-creative...',
    gap: 2000,
    className: 'text-slate-400',
  },
  { kind: 'span', text: 'Template files scaffolded!', className: 'text-slate-400' },
  { kind: 'span', text: '✔ Project ready!', className: 'text-emerald-400 font-medium mb-4' },

  { kind: 'span', text: 'Next steps:', className: ' font-semibold text-blue-400' },
  { kind: 'span', text: '1. cd react-creative-app', className: 'ml-[2ch] text-slate-200' },
  { kind: 'span', text: '2. npm install; npm run format', className: 'ml-[2ch] text-slate-200' },
  { kind: 'span', text: '3. npm run dev', gap: 200, className: 'ml-[2ch] text-slate-200 mb-4' },

  { kind: 'span', text: 'Or copy & paste the following:', className: ' text-blue-400' },
  {
    kind: 'span',
    text: 'cd react-creative-app; npm install;',
    gap: 200,
    className: 'ml-[2ch] text-slate-200',
  },
  {
    kind: 'span',
    text: 'npm run format; npm run dev',
    gap: 200,
    className: 'ml-[2ch] text-slate-200 mb-4',
  },

  { kind: 'span', text: 'Get creative and happy building ✨', gap: 200, className: 'text-emerald-400' },
];

export default function DemoVideoSection() {
  const renderedLines: JSX.Element[] = [];
  let delay = 0;
  const defaultSpanGap = 280;
  const defaultTypingGap = 420;
  const typingSpeedMultiplier = 0.65;
  const gapMultiplier = 0.6;

  terminalScript.forEach((line, index) => {
    const key = `${line.kind}-${index}`;

    if (line.kind === 'typing') {
      const msPerChar = Math.max(16, Math.round((line.duration ?? 50) * typingSpeedMultiplier));
      const gapAfterLine = Math.round((line.gap ?? defaultTypingGap) * gapMultiplier);
      renderedLines.push(
        <TypingAnimation key={key} delay={delay} duration={msPerChar} className={line.className}>
          {line.text}
        </TypingAnimation>
      );
      delay += line.text.length * msPerChar + gapAfterLine;
    } else {
      const gapAfterLine = Math.round((line.gap ?? defaultSpanGap) * gapMultiplier);
      renderedLines.push(
        <AnimatedSpan key={key} delay={delay} className={line.className}>
          {line.text}
        </AnimatedSpan>
      );
      delay += gapAfterLine;
    }
  });

  const terminalRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set(terminalRef.current, { y: -150 });
    gsap.to(terminalRef.current, {
      y: 0,
      duration: 1,
      scrollTrigger: {
        trigger: '#demo',
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
        // markers: true,
      },
    });
  });

  return (
    <section id="demo" aria-labelledby="demo-heading" className="bg-slate-950 py-16">
      <div className={`section-container flex flex-col gap-12`}>
        <div ref={terminalRef} className="relative flex w-full items-center justify-center">
          <Terminal className="glow h-full border-white/20 bg-black text-xs leading-snug text-slate-300 sm:text-sm md:text-base">
            {renderedLines}
          </Terminal>
        </div>
      </div>
    </section>
  );
}
