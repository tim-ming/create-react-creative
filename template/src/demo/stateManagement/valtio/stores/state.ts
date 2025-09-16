import { proxy } from 'valtio';

type State = {
  count: number;
};

export const counterStore = proxy<State>({
  count: 0,
});

export const increment = () => {
  counterStore.count++;
};

export const decrement = () => {
  counterStore.count--;
};
