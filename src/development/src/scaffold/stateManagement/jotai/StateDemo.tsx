import { useAtom } from 'jotai';
import { countAtom, incrementAtom, decrementAtom, todosAtom, addTodoAtom, toggleTodoAtom } from './stores/state';

function Counter() {
  const [count] = useAtom(countAtom);
  const [, increment] = useAtom(incrementAtom);
  const [, decrement] = useAtom(decrementAtom);

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

function Todos() {
  const [todos] = useAtom(todosAtom);
  const [, addTodo] = useAtom(addTodoAtom);
  const [, toggleTodo] = useAtom(toggleTodoAtom);

  return (
    <div>
      <button onClick={() => addTodo('New Task')}>Add Todo</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id} onClick={() => toggleTodo(t.id)}>
            {t.title} {t.completed ? '✅' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StateDemo() {
  return (
    <div>
      <Counter />
      <Todos />
    </div>
  );
}
