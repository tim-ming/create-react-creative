import { useAtomValue, useSetAtom } from 'jotai';
import { countAtom, decrementAtom, incrementAtom } from './stores/state';

export default function Counter() {
  const count = useAtomValue(countAtom);
  const increment = useSetAtom(incrementAtom);
  const decrement = useSetAtom(decrementAtom);
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
        <p className="text-sm text-gray-500">State managed by Jotai.</p>
      </section>
    </div>
  );
}
