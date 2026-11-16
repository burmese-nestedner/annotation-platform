import axios from "axios";

// Requests go to /api/* and are proxied to FastAPI by Vite (see vite.config.ts).
export const api = axios.create({ baseURL: "/api" });

export async function getHealth(): Promise<{ status: string; database?: string }> {
  const res = await api.get("/health/db");
  return res.data;
}
