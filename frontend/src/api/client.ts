import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

export async function getHealth(): Promise<{ status: string; database?: string }> {
  const res = await api.get("/health/db");
  return res.data;
}
