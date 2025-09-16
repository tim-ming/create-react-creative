import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

type CounterState = {
  value: number;
};

const initialState: CounterState = {
  value: 0,
};

// Counter slice
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// Configure the store
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// Export actions
export const { increment, decrement } = counterSlice.actions;
export const selectCount = (state: RootState) => state.counter.value;

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
