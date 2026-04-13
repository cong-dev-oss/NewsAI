export const PLACEHOLDER_STORY_IMAGE = "/images/news-placeholder.svg";

const INVALID_IMAGE_VALUES = new Set(["", "null", "undefined", "n/a", "na", "-"]);

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(value);

const normalizeApiBase = (apiBase) => String(apiBase || "").trim().replace(/\/+$/, "");

const normalizeCandidate = (value) => String(value || "").trim();

const isValidCandidate = (value) => !INVALID_IMAGE_VALUES.has(value.toLowerCase());

export function resolveStoryImage(story = {}, { apiBase = "" } = {}) {
  const candidates = [story?.hero_image, story?.image_url, story?.image]
    .map(normalizeCandidate)
    .filter((value) => value && isValidCandidate(value));

  if (candidates.length === 0) {
    return PLACEHOLDER_STORY_IMAGE;
  }

  const source = candidates[0];
  if (source.startsWith("data:image/")) {
    return source;
  }
  if (source.startsWith("//")) {
    return `https:${source}`;
  }
  if (isAbsoluteHttpUrl(source)) {
    return source;
  }

  const base = normalizeApiBase(apiBase);
  if (!base) {
    return PLACEHOLDER_STORY_IMAGE;
  }

  if (source.startsWith("/")) {
    return `${base}${source}`;
  }
  return `${base}/${source}`;
}
