import type { User } from "@repo/types";
import { API_ENDPOINTS } from "../constants";
import { client } from "./client";

export async function fetchUsersByIds(ids: string[]): Promise<User[]> {
  return client.get<User[]>(`${API_ENDPOINTS.admin.users}/batch`, {
    ids: ids.join(","),
  });
}
