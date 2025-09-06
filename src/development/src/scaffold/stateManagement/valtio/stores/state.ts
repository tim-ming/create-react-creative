// ===== VALTIO =====
// Valtio uses proxy-based state management
import { proxy } from "valtio";

// Global state store
export const valtioStore = proxy({
  count: 0,
  todos: [] as Array<{ id: number; title: string; completed: boolean }>,
  isLoading: false,
});

// Actions for valtio store
export const valtioActions = {
  increment: () => {
    valtioStore.count++;
  },
  decrement: () => {
    valtioStore.count--;
  },
  addTodo: (title: string) => {
    const newTodo = {
      id: Date.now(),
      title,
      completed: false,
    };
    valtioStore.todos.push(newTodo);
  },
  toggleTodo: (id: number) => {
    const todo = valtioStore.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  },
};
