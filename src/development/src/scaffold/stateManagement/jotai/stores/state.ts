// ===== JOTAI =====
import { atom } from "jotai";

// --- Atoms (state containers) ---
export const countAtom = atom(0);

export const todosAtom = atom<
  Array<{ id: number; title: string; completed: boolean }>
>([]);

// --- Action atoms (write-only or read/write) ---

// Increment / Decrement
export const incrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1);
});

export const decrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) - 1);
});

// Add a todo
export const addTodoAtom = atom(null, (get, set, title: string) => {
  set(todosAtom, [
    ...get(todosAtom),
    { id: Date.now(), title, completed: false },
  ]);
});

// Toggle todo completion
export const toggleTodoAtom = atom(null, (get, set, id: number) => {
  set(
    todosAtom,
    get(todosAtom).map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
});
