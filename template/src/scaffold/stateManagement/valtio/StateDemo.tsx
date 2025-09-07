import { useSnapshot } from 'valtio';
import { valtioStore, valtioActions } from './stores/state';

export default function StateDemo() {
  const snap = useSnapshot(valtioStore);

  return (
    <div>
      <h2>Valtio Example</h2>
      <div>
        <h3>Counter</h3>
        <p>Count: {snap.count}</p>
        <button onClick={valtioActions.increment}>Increment</button>
        <button onClick={valtioActions.decrement}>Decrement</button>
      </div>
      <div>
        <h3>Todos</h3>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              valtioActions.addTodo(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        <ul>
          {snap.todos.map((todo) => (
            <li
              key={todo.id}
              onClick={() => valtioActions.toggleTodo(todo.id)}
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
