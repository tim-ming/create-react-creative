import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  function increment() {
    setCount(count + 1);
  }
  function decrement() {
    setCount(count - 1);
  }
  return (
    <div className="mx-auto max-w-md">
      {/* Counter Section */}
      <section className="flex flex-col items-center justify-center gap-4 rounded">
        <p className="text-6xl font-medium text-white mix-blend-difference">{count}</p>
        <div className="flex gap-2">
          <button onClick={increment} className="counter-btn">
            +
          </button>
          <button onClick={decrement} className="counter-btn">
            -
          </button>
        </div>
        <p className="inline text-sm text-gray-500">No state management libraries configured, using useState().</p>
      </section>
    </div>
  );
}
