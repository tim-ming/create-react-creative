import { useRef } from 'react';
import reactIcon from '@/assets/react.svg';
import viteIcon from '@/assets/vite.svg';
import tailwindIcon from '@/assets/tailwind.svg';
import typescriptIcon from '@/assets/typescript.png';
import eslintIcon from '@/assets/eslint.svg';
import prettierIcon from '@/assets/prettier.webp';
import gsapIcon from '@/assets/gsap.svg';
import motionIcon from '@/assets/motion.webp';
import reactSpringIcon from '@/assets/react-spring.webp';
import zustandIcon from '@/assets/zustand.webp';
import valtioIcon from '@/assets/valtio.webp';
import jotaiIcon from '@/assets/jotai.webp';
import reduxIcon from '@/assets/redux.svg';
import threeIcon from '@/assets/three.svg';
import pmndrsIcon from '@/assets/pmndrs.webp';
import lenisIcon from '@/assets/lenis.svg';
import levaIcon from '@/assets/leva.svg';
import useGestureIcon from '@/assets/use-gesture.svg';
import postprocessingIcon from '@/assets/postprocessing.svg';
import githubIcon from '@/assets/github.svg';

type IconRef = string | string[];

type OptionalLibrary = Library & {
  categories: string[];
};

type Library = {
  name: string;
  description: string;
  link: string;
  icon: IconRef;
  ctaLabel?: string;
};

const coreLibraries: Library[] = [
  {
    name: 'React',
    description: 'Latest concurrent features, server directives, and streaming-first entry points.',
    link: 'https://react.dev',
    icon: reactIcon,
  },
  {
    name: 'Vite',
    description: 'Lightning-fast dev server with opinionated TS + JSX build pipelines ready for deployment.',
    link: 'https://vite.dev',
    icon: viteIcon,
  },
  {
    name: 'Tailwind',
    description: 'Author responsive design tokens directly in CSS using the new Tailwind runtime.',
    link: 'https://tailwindcss.com',
    icon: tailwindIcon,
  },
  {
    name: 'TypeScript',
    description: 'Strict mode enabled out of the box so the generated codebase scales with confidence.',
    link: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html',
    icon: typescriptIcon,
  },
  {
    name: 'ESLint + Prettier',
    description: 'Pre-configured linting and formatting pipelines wired into npm scripts and CI.',
    link: 'https://eslint.org',
    icon: [eslintIcon, prettierIcon],
  },
];

const optionalLibraries: OptionalLibrary[] = [
  {
    name: 'GSAP',
    description: 'Industry-standard timeline engine for scroll-linked scenes and fine-grained motion control.',
    link: 'https://greensock.com/gsap/',
    categories: ['Animations'],
    icon: gsapIcon,
  },
  {
    name: 'Motion (framer-motion)',
    description: 'Declarative animations, layout transitions, and gestures built for React.',
    link: 'https://motion.dev',
    categories: ['Animations'],
    icon: motionIcon,
  },
  {
    name: 'react-spring',
    description: 'Physics-based animation primitives for fluid interactions and component choreography.',
    link: 'https://react-spring.dev/',
    categories: ['Animations'],
    icon: reactSpringIcon,
  },
  {
    name: 'Zustand',
    description: 'Minimal state container with hooks-based APIs and async hydration helpers.',
    link: 'https://zustand-demo.pmnd.rs',
    categories: ['State Management'],
    icon: zustandIcon,
  },
  {
    name: 'Valtio',
    description: 'Proxy-based state with instant snapshots and zero-boilerplate mutations.',
    link: 'https://valtio.dev',
    categories: ['State Management'],
    icon: valtioIcon,
  },
  {
    name: 'Jotai',
    description: 'Composable atomic state pieces that scale from local UI to global data flows.',
    link: 'https://jotai.org/',
    categories: ['State Management'],
    icon: jotaiIcon,
  },
  {
    name: 'Redux Toolkit',
    description: 'Opinionated Redux bundles that streamline reducers, thunks, and devtools.',
    link: 'https://redux-toolkit.js.org/',
    categories: ['State Management'],
    icon: reduxIcon,
  },
  {
    name: 'React Three Fiber (r3f) + Drei',
    description: 'React renderer for Three.js with ready-made helpers for lighting, cameras, and controls.',
    link: 'https://r3f.docs.pmnd.rs/getting-started/introduction',
    categories: ['3D'],
    icon: pmndrsIcon,
  },
  {
    name: '@react-three-postprocessing',
    description:
      'Drop-in post-processing pipeline bringing bloom, depth of field, and cinematic effects to r3f scenes.',
    link: 'https://react-postprocessing.docs.pmnd.rs/introduction',
    categories: ['3D'],
    icon: postprocessingIcon,
  },
  {
    name: 'leva',
    description: 'Tree-structured GUI panel for tweaking scene parameters from within the browser.',
    link: 'https://github.com/pmndrs/leva',
    categories: ['3D'],
    icon: levaIcon,
  },
  {
    name: 'Three.js',
    description: 'Proven WebGL engine powering shaders, materials, and geometry under the hood.',
    link: 'https://threejs.org/',
    categories: ['3D'],
    icon: threeIcon,
  },
  {
    name: 'Lenis',
    description: 'Hardware-accelerated smooth scrolling with accessibility-friendly defaults.',
    link: 'https://lenis.darkroom.engineering',
    categories: ['Creative Tools'],
    icon: lenisIcon,
  },
  {
    name: 'use-gesture',
    description: 'Pointer, wheel, and scroll bindings to craft intuitive interactions with little code.',
    link: 'https://use-gesture.netlify.app',
    categories: ['Creative Tools'],
    icon: useGestureIcon,
  },
  {
    name: 'Request a library',
    description: 'Missing a library? Feature request issues are welcomed.',
    link: 'https://github.com/tim-ming/create-react-creative/issues/new?template=feature_request.md',
    categories: ['Requests'],
    icon: githubIcon,
    ctaLabel: 'Request on GitHub',
  },
];

const optionalLibraryCategories = optionalLibraries.reduce<string[]>((acc, library) => {
  library.categories.forEach((category) => {
    if (!acc.includes(category)) {
      acc.push(category);
    }
  });
  return acc;
}, []);

function LibraryIcon({ icon, name }: { icon?: IconRef; name: string }) {
  if (!icon) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/70 ring-1 ring-slate-700/60">
        <span className="text-sm font-semibold text-slate-200">{name.charAt(0)}</span>
      </div>
    );
  }

  if (Array.isArray(icon)) {
    return (
      <div className="flex items-center -space-x-3">
        {icon.map((src, index) => (
          <div
            key={`${name}-icon-${index}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/70 ring-1 ring-slate-700/60"
          >
            <img src={src} alt={`${name} logo`} className="h-7 w-7 object-contain" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/70 ring-1 ring-slate-700/60">
      <img src={icon} alt={`${name} logo`} className="h-7 w-7 object-contain" />
    </div>
  );
}

function LibraryCard({ library }: { library: Library }) {
  return (
    <article
      key={library.name}
      data-core-card
      className="flex h-full flex-col gap-3 rounded-xl border border-slate-700/70 bg-slate-900/50 p-5 text-left transition hover:border-blue-400/60 hover:bg-slate-900/80"
    >
      <div className="flex items-center gap-3">
        <LibraryIcon icon={library.icon} name={library.name} />
        <h4 className="text-base font-medium text-slate-100 sm:text-lg">{library.name}</h4>
      </div>
      <p className="flex-1 text-sm leading-snug text-slate-400">{library.description}</p>
      <a
        href={library.link}
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex w-fit items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
      >
        {library.ctaLabel ?? 'View docs'}
        <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export default function LibrariesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      id="libraries"
      ref={sectionRef}
      aria-labelledby="libraries-heading"
      className="relative overflow-hidden py-16"
    >
      <div className={`section-container-wide relative flex flex-col gap-20`}>
        <div className="text-center">
          <h2 id="libraries-heading" className="mb-4 text-4xl font-medium text-slate-100 sm:text-5xl">
            Zero-friction creative engineering.
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            A flexible production stack tuned for creative engineering. Get straight to the creative process.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="text-xl font-medium text-slate-100">Pre-configured when you run the CLI</h3>
            <p className="text-sm text-slate-400">Optimised for DX.</p>
          </div>
          <ul
            role="list"
            aria-labelledby="core-libraries"
            className="xs:grid-cols-2 grid gap-4 sm:gap-6 lg:grid-cols-3"
          >
            {coreLibraries.map((library) => (
              <li key={library.name}>
                <LibraryCard library={library} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="text-xl font-medium text-slate-100">Extra libraries</h3>
            <p className="text-sm text-slate-400">
              Browse stacks for animation, state management, 3D tooling, and more.
            </p>
          </div>
          {optionalLibraryCategories.map((category) => {
            const categoryId = `optional-libraries-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            const librariesForCategory = optionalLibraries.filter((library) => library.categories.includes(category));

            return (
              <div key={category} className="space-y-4">
                <h4 id={categoryId} className="text-lg font-medium text-slate-100">
                  {category}
                </h4>
                <ul
                  role="list"
                  aria-labelledby={categoryId}
                  className="xs:grid-cols-2 grid gap-4 sm:gap-6 lg:grid-cols-3"
                >
                  {librariesForCategory.map((library) => (
                    <li key={library.name}>
                      <LibraryCard library={library} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
