import api, { apiFormData } from "@/lib/axios";
import {
  Cosmetic,
  CosmeticSlot,
  InventoryItem,
  UserEquip,
} from "@/types";

export async function getCatalog(): Promise<Cosmetic[]> {
  const response = await api.get<{ data: Cosmetic[] }>("/api/cosmetics/catalog");
  return response.data.data;
}

export async function getUserCosmetics(username: string): Promise<UserEquip> {
  const response = await api.get<UserEquip>(`/api/users/${username}/cosmetics`);
  return response.data;
}

export async function batchGetCosmetics(
  usernames: string[]
): Promise<Record<string, UserEquip>> {
  if (usernames.length === 0) return {};
  const response = await api.post<{ data: Record<string, UserEquip> }>(
    "/api/cosmetics/batch",
    { usernames }
  );
  return response.data.data;
}

export async function purchaseCosmetic(cosmeticId: number): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(`/api/cosmetics/${cosmeticId}/purchase`);
  return response.data;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await api.get<{ data: InventoryItem[] }>("/api/inventory");
  return response.data.data;
}

export async function equipCosmetic(
  slot: CosmeticSlot,
  cosmeticId: number
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/api/cosmetics/equip", {
    slot,
    cosmetic_id: cosmeticId,
  });
  return response.data;
}

export async function unequipCosmetic(slot: CosmeticSlot): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/api/cosmetics/unequip", { slot });
  return response.data;
}

export interface AdminCosmeticInput {
  slot: CosmeticSlot;
  sub_type?: "ring" | "decoration";
  render_type: "css" | "image";
  name: string;
  price: number;
  min_rank?: string;
  status?: "draft" | "published" | "retired";
  preset_key?: string;
  animated?: File;
  static?: File;
}

function toFormData(input: AdminCosmeticInput): FormData {
  const form = new FormData();
  form.append("slot", input.slot);
  if (input.sub_type) form.append("sub_type", input.sub_type);
  form.append("render_type", input.render_type);
  form.append("name", input.name);
  form.append("price", String(input.price));
  if (input.min_rank) form.append("min_rank", input.min_rank);
  if (input.status) form.append("status", input.status);
  if (input.preset_key) form.append("preset_key", input.preset_key);
  if (input.animated) form.append("animated", input.animated);
  if (input.static) form.append("static", input.static);
  return form;
}

export async function adminCreateCosmetic(input: AdminCosmeticInput): Promise<Cosmetic> {
  const response = await apiFormData.post<Cosmetic>("/api/admin/cosmetics", toFormData(input));
  return response.data;
}

export async function adminUpdateCosmetic(
  id: number,
  input: AdminCosmeticInput
): Promise<Cosmetic> {
  const response = await apiFormData.put<Cosmetic>(
    `/api/admin/cosmetics/${id}`,
    toFormData(input)
  );
  return response.data;
}
