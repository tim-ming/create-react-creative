// ===== JOTAI =====
import { atom } from 'jotai';

// --- Atoms (state containers) ---
export const countAtom = atom(0);

// --- Action atoms (write-only or read/write) ---

// Increment / Decrement
export const incrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1);
});

export const decrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) - 1);
});
