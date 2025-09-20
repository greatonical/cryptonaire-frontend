import { create } from "zustand";

type UIState = {
  hideTabBar: boolean;
  setHideTabBar: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  hideTabBar: false,
  setHideTabBar: (v) => set({ hideTabBar: v }),
}));