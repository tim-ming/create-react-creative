import ReactLogo from '@/assets/react.svg?react';
import ViteLogo from '@/assets/vite.svg?react';
import { Fragment, useRef } from 'react';

function App() {
  const defaultDocs = useRef([
    {
      name: 'react',
      url: 'https://react.dev',
    },
    {
      name: 'vite',
      url: 'https://vite.dev',
    },
    {
      name: 'tailwindcss',
      url: 'https://tailwindcss.com',
    },
  ]);
  return (
    <div className="relative">
      <Effects></Effects>
      <Background></Background>
      <div className="mx-auto flex h-screen w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-12">
        <div className="mb-40 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-8">
            <a href="https://react.dev" className="group" target="_blank" rel="noopener noreferrer">
              <ReactLogo className="stack-logo animate-spin [animation-duration:10s] group-hover:drop-shadow-[0_0_2em_#61dafbaa]" />
            </a>
            <a href="https://vite.dev" className="group" target="_blank" rel="noopener noreferrer">
              <ViteLogo className="stack-logo group-hover:drop-shadow-[0_0_2em_#646cffaa]" />
            </a>
          </div>
          <Header></Header>
        </div>
        <Grid></Grid>
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-neutral-300 p-4 md:p-6">
          <p className="mb-2 font-medium">Docs</p>
          <Docs docs={defaultDocs.current} />
        </div>
      </div>
    </div>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return <div className="">{children}</div>;
}

function Grid({ children }: { children?: React.ReactNode }) {
  return <div className="mb-8 grid w-full gap-6">{children}</div>;
}

function Effects({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function Background({ children }: { children?: React.ReactNode }) {
  return <div className="fixed inset-0 -z-10 bg-neutral-100">{children}</div>;
}

type Doc = {
  name: string;
  url: string;
};

function Link({ doc }: { doc: Doc }) {
  return (
    <a
      href={doc.url}
      className="text-sm leading-tight text-blue-600 hover:text-blue-800 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {doc.name}
    </a>
  );
}
function Docs({ docs }: { docs: Doc[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:gap-x-4">
      {docs.map((doc, index) => (
        <Fragment key={doc.name + index}>
          <Link doc={doc} />
          {index < docs.length - 1 && <span className="h-3 w-px bg-neutral-300" />}
        </Fragment>
      ))}
    </div>
  );
}

export default App;
