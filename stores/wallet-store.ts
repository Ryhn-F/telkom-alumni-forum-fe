import { create } from "zustand";
import { getWallet } from "@/lib/wallet";

interface WalletState {
  balance: number | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  setBalance: (balance: number) => void;
}

// Balance changes independently of auth (purchases, mission claims) and is
// read from multiple unrelated places (navbar chip, shop, missions page) —
// a small dedicated store lets any of them trigger a refetch without prop
// drilling, matching the auth-store precedent for shared client state.
export const useWalletStore = create<WalletState>()((set) => ({
  balance: null,
  isLoading: false,
  refetch: async () => {
    set({ isLoading: true });
    try {
      const { balance } = await getWallet();
      set({ balance, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  setBalance: (balance) => set({ balance }),
}));
