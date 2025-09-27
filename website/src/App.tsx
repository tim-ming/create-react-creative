import HeroSection from '@/components/HeroSection';
import LibrariesSection from '@/components/LibrariesSection';
import DemoVideoSection from '@/components/DemoVideoSection';
import CallToAction from '@/components/CallToAction';
import SiteFooter from '@/components/SiteFooter';
import Lenis from '@/Lenis';

function App() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded-md focus:bg-blue-400 focus:px-4 focus:py-2 focus:text-slate-950 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Lenis />
      <main id="main-content" className="flex flex-col">
        <HeroSection />
        <div className="relative bg-slate-950">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]"
            aria-hidden="true"
          />
          <DemoVideoSection />
          <LibrariesSection />
          <CallToAction />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
