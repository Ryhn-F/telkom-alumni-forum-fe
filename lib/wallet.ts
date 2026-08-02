import api from "@/lib/axios";
import { WalletResponse } from "@/types";

export async function getWallet(): Promise<WalletResponse> {
  const response = await api.get<WalletResponse>("/api/wallet");
  return response.data;
}
