import { motion } from "motion/react";

export default function AnimationDemo() {
  return (
    <div>
      <h2>Framer Motion Example</h2>
      <motion.div
        style={{
          width: "100px",
          height: "100px",
          background: "blue",
          margin: "20px",
        }}
        animate={{
          scale: [1, 2, 2, 1, 1],
          rotate: [0, 0, 270, 270, 0],
          borderRadius: ["20%", "20%", "50%", "50%", "20%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
    </div>
  );
}
