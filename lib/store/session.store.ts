import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  address?: `0x${string}`;
  jwt?: string;
  setAddress: (a?: `0x${string}`) => void;
  setJwt: (t?: string) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      address: undefined,
      jwt: undefined,
      setAddress: (address) => set({ address }),
      setJwt: (jwt) => set({ jwt }),
      clear: () => set({ address: undefined, jwt: undefined }),
    }),
    { name: "cryptonaire-session" }
  )
);