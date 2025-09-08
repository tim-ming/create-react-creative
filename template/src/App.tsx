import ReactLogo from '@/assets/react.svg?react';

function App() {
  return (
    <>
      <Effects></Effects>
      <div className="container mx-auto mt-16 gap-4 flex flex-col items-center">
        <ReactLogo width={100} height={100} />
        <Header></Header>
        <Grid></Grid>
      </div>
    </>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>;
}

function Grid({ children }: { children?: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-6">{children}</div>;
}

function Effects({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export default App;
