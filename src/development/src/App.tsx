import ReactLogo from "@/assets/react.svg?react";
import Lenis from "./scaffold/creative/lenis/Lenis";
import AnimationDemo from "./scaffold/animation/gsap/AnimationDemo";
import StateDemo from "./scaffold/stateManagement/zustand/StateDemo";
import ThreeDemo from "./scaffold/three/r3f/ThreeDemo";

function App() {
  return (
    <>
      <Effects>
        <Lenis />
      </Effects>
      <div className="container mx-auto mt-16 gap-4 flex flex-col items-center">
        <ReactLogo width={100} height={100} />
        <Header>
          <AnimationDemo />
        </Header>
        <Grid>
          <StateDemo />
          <ThreeDemo />
        </Grid>
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
