import { type AppType } from "@server/index.ts";
// import { queryOptions } from "@tanstack/react-query";
import { hc } from "hono/client";

const client = hc<AppType>("/");

export const api = client.api;

export async function getData(query: string) {
  const res = await api.scrape.$get({ query: { q: query } })

  if (!res.ok) {
    throw new Error("Server error")
  }

  const data = await res.json()
  return data;
}
