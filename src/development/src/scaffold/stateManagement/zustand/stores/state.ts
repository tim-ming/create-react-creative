// ===== ZUSTAND =====
// Zustand uses a simple store pattern with hooks
import { create } from 'zustand';

// Basic store with actions
export const useZustandStore = create<{
  count: number;
  todos: Array<{ id: number; title: string; completed: boolean }>;
  increment: () => void;
  decrement: () => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: number) => void;
}>((set, _) => ({
  count: 0,
  todos: [],
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  addTodo: (title) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), title, completed: false }],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    })),
}));
