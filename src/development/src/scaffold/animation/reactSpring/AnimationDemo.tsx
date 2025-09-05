import { useSpring, animated } from "@react-spring/web";

export default function AnimationDemo() {
  const styles = useSpring({
    from: { opacity: 0, y: -100 },
    to: { opacity: 1, y: 0 },
    config: { duration: 1000 },
  });

  return (
    <div>
      <h2>React Spring Example</h2>
      <animated.div
        style={{
          ...styles,
          width: "100px",
          height: "100px",
          background: "magenta",
          margin: "20px",
        }}
      />
    </div>
  );
}
