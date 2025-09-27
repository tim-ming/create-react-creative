import BackgroundScene from '@/BackgroundScene';
import { TerminalIcon, CheckIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCopyToClipboard } from '@/hooks';
import { CopyIcon } from 'lucide-react';
import GithubIcon from '@/assets/github.svg?react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '@/assets/vite.svg';
import tailwindLogo from '@/assets/tailwind.svg';
import gsapLogo from '@/assets/gsap.svg';
import threeLogo from '@/assets/three.svg';
import pmndrsLogo from '@/assets/pmndrs.webp';
import zustandLogo from '@/assets/zustand.webp';
import jotaiLogo from '@/assets/jotai.webp';
import motionLogo from '@/assets/motion.webp';
import reactSpringLogo from '@/assets/react-spring.webp';
import prettierLogo from '@/assets/prettier.webp';
import eslintLogo from '@/assets/eslint.svg';
import reduxLogo from '@/assets/redux.svg';
import valtioLogo from '@/assets/valtio.webp';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);

type TechStackItem = {
  name: string;
  logo: string;
};

const techStacks: TechStackItem[] = [
  { name: 'React', logo: reactLogo },
  { name: 'Vite', logo: viteLogo },
  { name: 'Tailwind CSS', logo: tailwindLogo },
  { name: 'GSAP', logo: gsapLogo },
  { name: 'Three.js', logo: threeLogo },
  { name: 'pmndrs', logo: pmndrsLogo },
  { name: 'Zustand', logo: zustandLogo },
  { name: 'Jotai', logo: jotaiLogo },
  { name: 'Framer Motion', logo: motionLogo },
  { name: 'React Spring', logo: reactSpringLogo },
  { name: 'Redux Toolkit', logo: reduxLogo },
  { name: 'Valtio', logo: valtioLogo },
  { name: 'Prettier', logo: prettierLogo },
  { name: 'ESLint', logo: eslintLogo },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [copied, copy] = useCopyToClipboard();
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const copyCommand = 'npm create react-creative@latest';

  useEffect(() => {
    if (copied !== copyCommand) {
      return;
    }

    setShowCopyFeedback(true);
    const timeoutId = window.setTimeout(() => {
      setShowCopyFeedback(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [copied, copyCommand]);

  const handleCopyNpmScript = () => {
    copy(copyCommand)
      .then(() => {
        console.log('Copied!', { text: copyCommand });
      })
      .catch((error) => {
        console.error('Failed to copy!', error);
      });
  };

  useGSAP(
    () => {
      const title = SplitText.create(titleRef.current, { type: 'chars', mask: 'chars' });
      const copy = SplitText.create(copyRef.current, { type: 'words', mask: 'words' });

      const tl = gsap.timeline({
        defaults: {
          duration: 1,
          ease: 'power3.out',
        },
      });
      tl.from(
        badgeRef.current,
        {
          y: -20,
          opacity: 0,
        },
        '0'
      );
      tl.from(
        title.chars,
        {
          y: '-100%',
          opacity: 0,
          stagger: {
            each: 0.01,
            from: 'center',
          },
        },
        '0.15'
      );
      tl.from(
        copy.words,
        {
          y: '-100%',
          opacity: 0,
          stagger: {
            each: 0.02,
            from: 'center',
          },
        },
        '0.3'
      );
      tl.from(
        actionsRef.current,
        {
          y: -20,
          opacity: 0,
        },
        '0.3'
      );
    },
    { scope: containerRef }
  );
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden bg-slate-100 text-slate-100">
      <div className="absolute inset-0">
        <BackgroundScene />
        {/* <div className="absolute inset-0 bg-slate-950/70" aria-hidden="true" /> */}
      </div>

      <div
        ref={containerRef}
        className={`section-container-wide relative flex min-h-screen flex-col items-center py-[calc(8%+5rem)]`}
      >
        <div
          className="mb-8 flex items-center gap-2 rounded-full border border-blue-600 bg-white/20 px-5 py-2 text-sm font-medium text-black backdrop-blur-sm"
          ref={badgeRef}
        >
          <TerminalIcon className="h-4 w-4 stroke-2 text-blue-600" />
          <span>
            Interactive CLI based on <code>create-vite</code>
          </span>
        </div>

        <div className="mb-8 flex flex-col items-center justify-center gap-4">
          <h1
            id="hero-heading"
            ref={titleRef}
            data-hero-title
            className="text-center text-4xl leading-[0.9] font-medium tracking-tight text-black/90 sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            React Creative Starter
          </h1>
          <p ref={copyRef} className="text-center leading-snug text-slate-700">
            Zero-friction creative engineering in React.
          </p>
        </div>
        <button
          onClick={handleCopyNpmScript}
          className="mb-8 flex cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/40 p-1 text-black backdrop-blur-md transition hover:border-blue-400 hover:bg-white/60"
        >
          <div className="rounded-full bg-white/40 p-3 sm:p-5">
            {showCopyFeedback ? (
              <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <CopyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </div>
          <span className="px-2 font-mono text-sm font-medium sm:px-4 sm:text-base">{copyCommand}</span>
        </button>

        <div ref={actionsRef} className="mb-16 flex flex-wrap gap-5 text-lg">
          <a href="#get-started" className="group flex items-center justify-center text-base font-medium text-white">
            <span className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 transition group-hover:bg-blue-500">
              Get started
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 transition group-hover:bg-blue-500">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </a>

          <a
            href="https://github.com/tim-ming/create-react-creative"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border bg-white/20 px-6 py-3 text-base font-medium text-black backdrop-blur-sm transition hover:bg-white/40"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>

        <div className="mb-4 max-w-sm text-center text-neutral-700">
          <p>DX out-of-the-box. Skip the setup and build with the stack most creative developers prefer.</p>
        </div>
        <div className="relative w-full overflow-hidden" aria-label="Tech stack used in the scaffold">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#dcdceb] to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#dcdceb] to-transparent"
            aria-hidden="true"
          />
          <div className="relative flex items-center">
            <div className="animate-marquee flex min-w-max gap-12 py-6 pl-12" role="list">
              {techStacks.map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="flex shrink-0 items-center gap-4 text-black transition-colors"
                  role="listitem"
                >
                  <img
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    className="h-10 w-10 shrink-0 rounded-md object-contain md:h-12 md:w-12"
                  />
                </div>
              ))}
            </div>

            <div className="animate-marquee2 absolute left-0 flex min-w-max gap-12 py-6 pl-12" role="list">
              {techStacks.map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="flex shrink-0 items-center gap-4 text-black transition-colors"
                  role="listitem"
                >
                  <img
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    className="h-10 w-10 shrink-0 rounded-md object-contain md:h-12 md:w-12"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
