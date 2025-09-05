import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function AnimationDemo() {
  const boxRef = useRef(null);

  useEffect(() => {
    gsap.to(boxRef.current, {
      rotation: "+=360",
      duration: 2,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <div>
      <h2>GSAP Example</h2>
      <div
        ref={boxRef}
        style={{
          width: "100px",
          height: "100px",
          background: "green",
          margin: "20px",
        }}
      ></div>
    </div>
  );
}
