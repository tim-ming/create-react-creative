import { selectCount, increment, decrement, useAppDispatch, useAppSelector } from './stores/state';

export default function Counter() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);

  return (
    <div className="mx-auto max-w-md">
      {/* Counter Section */}
      <section className="flex flex-col items-center justify-center gap-4 rounded">
        <p className="text-6xl font-medium text-white mix-blend-difference">{count}</p>
        <div className="flex gap-2">
          <button onClick={() => dispatch(increment())} className="counter-btn">
            +
          </button>
          <button onClick={() => dispatch(decrement())} className="counter-btn">
            -
          </button>
        </div>
        <p className="text-sm text-gray-500">State managed by Redux Toolkit.</p>
      </section>
    </div>
  );
}
