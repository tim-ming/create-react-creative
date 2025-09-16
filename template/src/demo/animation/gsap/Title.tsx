import { useRef } from 'react';
import { gsap } from 'gsap';
import SplitText from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, useGSAP);

export default function Title() {
  const headerRef = useRef(null);
  const subheaderRef = useRef(null);
  useGSAP(() => {
    // Split the header text into characters
    const split = SplitText.create(headerRef.current, { type: 'chars', mask: 'chars' });
    const splitSubheader = SplitText.create(subheaderRef.current, { type: 'words', mask: 'words' });
    const tl = gsap.timeline();

    tl.from(split.chars, {
      y: '100%',
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: {
        each: 0.01,
        from: 'center', // start from middle and go outward
      },
    });

    tl.from(
      splitSubheader.words,
      {
        y: '100%',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: {
          each: 0.01,
          from: 'center', // start from middle and go outward
        },
      },
      '0.1'
    );
  });

  return (
    <div>
      <h1
        ref={headerRef}
        className="text-center text-4xl font-medium whitespace-nowrap sm:text-5xl lg:text-6xl xl:text-7xl [&>*]:mx-[-0.02em]"
      >
        React Creative Starter
      </h1>
      <div ref={subheaderRef} className="mt-4">
        <p className="text-center text-sm text-gray-500 md:text-base">
          Edit <code>src/App.tsx</code> to get started.
        </p>
      </div>
    </div>
  );
}
