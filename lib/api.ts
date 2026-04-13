import { Article } from "./mockData";
import { ENV, getNewsApiV1 } from "./env";
import { fetchFromNewsApi } from "./newsApi";
import { PLACEHOLDER_STORY_IMAGE, resolveStoryImage } from "./storyImage";

const INTERNAL_CATEGORIES_ENDPOINT = "/api/categories";
const INTERNAL_STORIES_ENDPOINT = "/api/stories";

const getRequestHeaders = (): HeadersInit => {
  return ENV.API_KEY ? { "X-Job-API-Key": ENV.API_KEY } : {};
};

const parseOrThrow = async (res: Response, fallbackMessage: string) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || fallbackMessage);
  }
  return data;
};

const buildQuery = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const mapStoryToArticle = (story: any): Article => ({
  id: String(story.id),
  url: story.original_url || "",
  title: story.title || "Untitled story",
  excerpt: story.deck || story.summary || (story.body ? String(story.body).slice(0, 180) + "..." : ""),
  category: story.topic_name || story.topic?.name || (story.story_type || "story").replace("_", " "),
  categoryColor: "#333",
  author: "Newsroom AI",
  authorInitials: "AI",
  date: new Date(story.published_at || story.created_at || Date.now()).toLocaleDateString("vi-VN"),
  readTime: "4 min read",
  image: resolveStoryImage(
    {
      ...story,
      hero_image: story.hero_image || story.effective_hero_image,
    },
    { apiBase: ENV.NEWS_API_URL },
  ),
  featured: false,
  summary: story.summary || "",
  content: story.body || "",
  story_type: story.story_type || "",
  highlights: Array.isArray(story.highlights)
    ? story.highlights.map((item: any) => ({
        title: item?.title || "Untitled signal",
        excerpt: item?.excerpt || "",
        image_url: resolveStoryImage(
          {
            hero_image: item?.image_url,
            image_url: item?.image_url,
          },
          { apiBase: ENV.NEWS_API_URL },
        ),
        original_url: item?.original_url || "",
        source_name: item?.source_name || "",
      }))
    : [],
});

const dedupeArticleImages = (articles: Article[]): Article[] => {
  const seenImages = new Set<string>();
  return articles.map((article) => {
    const imageKey = String(article.image || "").trim();
    if (!imageKey || imageKey === PLACEHOLDER_STORY_IMAGE) {
      return article;
    }
    if (seenImages.has(imageKey)) {
      return { ...article, image: PLACEHOLDER_STORY_IMAGE };
    }
    seenImages.add(imageKey);
    return article;
  });
};

export const getStories = async (
  limit = 10,
  topic?: string,
  storyType?: string,
  status = "published",
): Promise<Article[]> => {
  const query = buildQuery({
    limit: String(limit),
    topic_name: topic,
    story_type: storyType,
    status,
  });

  try {
    const res =
      typeof window !== "undefined"
        ? await fetch(`${INTERNAL_STORIES_ENDPOINT}${query}`, { cache: "no-store" })
        : await fetchFromNewsApi(`/stories/${query}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? dedupeArticleImages(data.map(mapStoryToArticle)) : [];
  } catch (error) {
    console.error("Fetch stories error:", error);
    return [];
  }
};

export const getStoryById = async (id: string | number): Promise<Article | null> => {
  try {
    const res =
      typeof window !== "undefined"
        ? await fetch(`${INTERNAL_STORIES_ENDPOINT}/${id}`, { cache: "no-store" })
        : await fetchFromNewsApi(`/stories/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return mapStoryToArticle(data);
  } catch (error) {
    console.error("Fetch story error:", error);
    return null;
  }
};

export const getArticles = async (
  limit: number = 10,
  category?: string,
  is_processed: boolean = true,
): Promise<Article[]> => {
  const status = is_processed ? "published" : "draft";
  return getStories(limit, category, undefined, status);
};

export const getAllArticles = async (limit = 100): Promise<any[]> => {
  const query = buildQuery({ limit: String(limit) });
  const res = await fetch(`${getNewsApiV1()}/stories/${query}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
};

export const getArticleById = async (id: string | number): Promise<Article | null> => {
  return getStoryById(id);
};

export const getCategories = async (): Promise<{ name: string; count: number }[]> => {
  try {
    const target =
      typeof window !== "undefined" ? INTERNAL_CATEGORIES_ENDPOINT : `${getNewsApiV1()}/stories/categories`;
    const res = await fetch(target, {
      cache: "no-store",
      headers: getRequestHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.warn("Fetch categories warning:", error);
    return [];
  }
};

export const api = {
  getStories,
  getStoryById,
  getArticles,
  getAllArticles,
  getArticleById,
  getCategories,
  deleteArticle: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/stories/${id}`, { method: "DELETE" });
    return parseOrThrow(res, "Delete story failed");
  },
  bulkDeleteArticles: async (ids: number[]) => {
    const res = await fetch(`${getNewsApiV1()}/stories/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return parseOrThrow(res, "Bulk delete stories failed");
  },
  getSources: () => fetch(`${getNewsApiV1()}/sources/`).then((res) => res.json()),
  createSource: (data: any) =>
    fetch(`${getNewsApiV1()}/sources/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => parseOrThrow(res, "Create source failed")),
  getTopics: () => fetch(`${getNewsApiV1()}/sources/topics`).then((res) => res.json()),
  createTopic: (data: any) =>
    fetch(`${getNewsApiV1()}/sources/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => parseOrThrow(res, "Create topic failed")),
  deleteTopic: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/sources/topics/${id}`, { method: "DELETE" });
    return parseOrThrow(res, "Delete topic failed");
  },
  getConfigs: () => fetch(`${getNewsApiV1()}/pipeline/configs`).then((res) => res.json()),
  createConfig: (data: any) =>
    fetch(`${getNewsApiV1()}/pipeline/configs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => parseOrThrow(res, "Create config failed")),
  updateConfig: (id: number, data: any) =>
    fetch(`${getNewsApiV1()}/pipeline/configs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => parseOrThrow(res, "Update config failed")),
  deleteConfig: async (id: number) => {
    const res = await fetch(`${getNewsApiV1()}/pipeline/configs/${id}`, { method: "DELETE" });
    return parseOrThrow(res, "Delete config failed");
  },
  getHistory: () => fetch(`${getNewsApiV1()}/research/runs`).then((res) => res.json()),
  triggerAll: () =>
    fetch(`${getNewsApiV1()}/pipeline/run-now`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "all" }),
    }).then((res) => res.json()),
};
