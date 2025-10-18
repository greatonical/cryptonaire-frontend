import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UIState = {
  hideTabBar: boolean;
  setHideTabBar: (v: boolean) => void;

  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;

  hydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      hideTabBar: false,
      setHideTabBar: (v) => set({ hideTabBar: v }),

      theme: "light",
      setTheme: (t) => set({ theme: t }),

      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "cryptonaire-ui",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);