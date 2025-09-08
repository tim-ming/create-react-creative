// ===== RTK (Redux Toolkit) =====
// RTK uses Redux with modern patterns and TypeScript support
import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';

// Counter slice
export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// Todos slice
export const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Array<{ id: number; title: string; completed: boolean }>,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.push({
        id: Date.now(),
        title: action.payload,
        completed: false,
      });
    },
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      return state.filter((todo) => todo.id !== action.payload);
    },
  },
});

// Configure the store
export const rtkStore = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    todos: todosSlice.reducer,
  },
});

// Export actions
export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;

// Export types
export type RootState = ReturnType<typeof rtkStore.getState>;
export type AppDispatch = typeof rtkStore.dispatch;
