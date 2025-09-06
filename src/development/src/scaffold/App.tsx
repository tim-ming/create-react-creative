import ReactLogo from '@/assets/react.svg?react';

function App() {
  return (
    <>
      <Effects></Effects>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <ReactLogo />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Grid></Grid>
    </>
  );
}

function Grid({ children }: { children?: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-6">{children}</div>;
}

function Effects({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export default App;
