import api from "@/lib/axios";
import { TransactionListResponse, WalletResponse } from "@/types";

export async function getWallet(): Promise<WalletResponse> {
  const response = await api.get<WalletResponse>("/api/wallet");
  return response.data;
}

export async function getTransactions(
  limit = 20,
  offset = 0
): Promise<TransactionListResponse> {
  const response = await api.get<TransactionListResponse>("/api/wallet/transactions", {
    params: { limit, offset },
  });
  return response.data;
}
