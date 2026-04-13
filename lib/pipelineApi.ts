import { getNewsApiV1 } from "./env";

const parseOrThrow = async (res: Response, fallbackMessage: string) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || fallbackMessage);
  }
  return data;
};

export const pipelineApi = {
  listConfigs: async () => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/configs`, { cache: "no-store" });
    return parseOrThrow(res, "List pipeline configs failed");
  },
  createConfig: async (payload: any) => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/configs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseOrThrow(res, "Create pipeline config failed");
  },
  updateConfig: async (id: number, payload: any) => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/configs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseOrThrow(res, "Update pipeline config failed");
  },
  deleteConfig: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/configs/${id}`, {
      method: "DELETE",
    });
    return parseOrThrow(res, "Delete pipeline config failed");
  },
  runNow: async (
    scope: "all" | "topic" | "config" | "source_topic" = "all",
    topic_id?: number,
    config_id?: number,
    source_type?: string,
  ) => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/run-now`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, topic_id, config_id, source_type }),
    });
    return parseOrThrow(res, "Run now failed");
  },
  listSources: async () => {
    const res = await fetch(`${getNewsApiV1()}/sources/`, { cache: "no-store" });
    return parseOrThrow(res, "List sources failed");
  },
  listTopics: async () => {
    const res = await fetch(`${getNewsApiV1()}/sources/topics`, { cache: "no-store" });
    return parseOrThrow(res, "List topics failed");
  },
};
