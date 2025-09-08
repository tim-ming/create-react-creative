import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './stores/state';
import { increment, decrement, addTodo, toggleTodo } from './stores/state';

export default function StateDemo() {
  const count = useSelector((state: RootState) => state.counter.value);
  const todos = useSelector((state: RootState) => state.todos);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div>
      <h2>RTK Example</h2>
      <div>
        <h3>Counter</h3>
        <p>Count: {count}</p>
        <button onClick={() => dispatch(increment())}>Increment</button>
        <button onClick={() => dispatch(decrement())}>Decrement</button>
      </div>
      <div>
        <h3>Todos</h3>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              dispatch(addTodo(e.currentTarget.value));
              e.currentTarget.value = '';
            }
          }}
        />
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              onClick={() => dispatch(toggleTodo(todo.id))}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
