import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Secure-LS (browser only) */
let ls: any = null;
function getSecureLS() {
  if (typeof window === "undefined") return null;
  if (ls) return ls;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const imported = require("secure-ls");
    const SecureLS = imported.default || imported;
    const encryptionKey =
      process.env.LOCAL_STORAGE_ENCRYPTION_KEY || "fallback-key-123";
    ls = new SecureLS({
      encodingType: "aes",
      isCompression: false,
      encryptionSecret: encryptionKey,
    });
    return ls;
  } catch (error) {
    console.error("Failed to initialize SecureLS:", error);
    // safe fallback to JSON localStorage
    return {
      set: (key: string, value: any) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.error("localStorage.setItem failed:", e);
        }
      },
      get: (key: string) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.error("localStorage.getItem failed:", e);
          return null;
        }
      },
      remove: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error("localStorage.removeItem failed:", e);
        }
      },
    };
  }
}

const secureStorage = createJSONStorage(() => ({
  setItem: (name, value) => {
    const s = getSecureLS();
    s?.set?.(name, value);
  },
  getItem: (name) => {
    const s = getSecureLS();
    try {
      return s?.get?.(name) ?? null;
    } catch {
      s?.remove?.(name);
      return null;
    }
  },
  removeItem: (name) => {
    const s = getSecureLS();
    s?.remove?.(name);
  },
}));

type SessionState = {
  address?: `0x${string}`;
  jwt?: string;
  onboardingSeen?: boolean;

  /** New: game session UI state */
  hasActiveSession: boolean;
  lastSessionAt?: number;

  /** New: privacy policy */
  privacyAcceptedV1: boolean;

  /** NEW: hydration flag for guards */
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  setAddress: (a?: `0x${string}`) => void;
  setJwt: (t?: string) => void;
  setOnboardingSeen: (v: boolean) => void;

  /** New helpers */
  markSessionActive: (on: boolean) => void;
  setLastSessionAt: (ts?: number) => void;
  setPrivacyAccepted: (v: boolean) => void;

  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      address: undefined,
      jwt: undefined,

      hasActiveSession: false,
      lastSessionAt: undefined,

      privacyAcceptedV1: false,

      /** NEW: start false, flip to true after rehydrate */
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      setAddress: (address) => set({ address }),
      setJwt: (jwt) => set({ jwt }),

      markSessionActive: (on: boolean) =>
        set({
          hasActiveSession: on,
          lastSessionAt: Date.now(),
        }),

      setLastSessionAt: (ts?: number) => set({ lastSessionAt: ts }),
      setPrivacyAccepted: (v: boolean) => set({ privacyAcceptedV1: v }),

      onboardingSeen: false,
      setOnboardingSeen: (onboardingSeen) => set({ onboardingSeen }),

      clear: () =>
        set({
          address: undefined,
          jwt: undefined,
          hasActiveSession: false,
          lastSessionAt: Date.now(),
          onboardingSeen: false,
          privacyAcceptedV1: false,
        }),
    }),
    {
      name: "cryptonaire-session",
      storage: secureStorage,
      // Flip hydration flag when state has been loaded from storage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true);
      },
    }
  )
);