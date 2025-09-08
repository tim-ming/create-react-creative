import { useZustandStore } from './stores/state';

export default function StateDemo() {
  const { count, todos, increment, decrement, addTodo, toggleTodo } = useZustandStore();

  return (
    <div>
      <h2>Zustand Example</h2>
      <div>
        <h3>Counter</h3>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
      </div>
      <div>
        <h3>Todos</h3>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTodo(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
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
