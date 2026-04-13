import { getNewsApiV1 } from "./env";
import { extractApiErrorMessage } from "./errorMessage";
import { clampApiLimit } from "./requestLimit";

const parseOrThrow = async (res: Response, fallbackMessage: string) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(extractApiErrorMessage(data, fallbackMessage));
  }
  return data;
};

export const storyApi = {
  list: async (params?: { status?: string; story_type?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.story_type) searchParams.set("story_type", params.story_type);
    if (params?.limit !== undefined) {
      searchParams.set("limit", String(clampApiLimit(params.limit, { min: 1, max: 200, fallback: 50 })));
    }
    const query = searchParams.toString();
    const url = `${getNewsApiV1()}/stories/${query ? `?${query}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    return parseOrThrow(res, "List stories failed");
  },
  listTopics: async () => {
    const res = await fetch(`${getNewsApiV1()}/sources/topics`, { cache: "no-store" });
    return parseOrThrow(res, "List topics failed");
  },
  getById: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/stories/${id}`, { cache: "no-store" });
    return parseOrThrow(res, "Get story failed");
  },
  review: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/stories/${id}/review`, {
      method: "POST",
    });
    return parseOrThrow(res, "Review story failed");
  },
  publish: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/stories/${id}/publish`, {
      method: "POST",
    });
    return parseOrThrow(res, "Publish story failed");
  },
  remove: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/stories/${id}`, { method: "DELETE" });
    return parseOrThrow(res, "Delete story failed");
  },
  bulkDelete: async (ids: number[]) => {
    const res = await fetch(`${getNewsApiV1()}/stories/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return parseOrThrow(res, "Bulk delete stories failed");
  },
};
