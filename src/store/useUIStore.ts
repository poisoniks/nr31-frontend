import { create } from 'zustand';

interface UIState {
    error: string | null;
    setError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    error: null,
    setError: (error) => set({ error }),
}));
