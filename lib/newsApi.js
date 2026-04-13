const DEFAULT_NEWS_API_ORIGINS = [
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8010",
];

const normalizeOrigin = (value) => {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

export const getNewsApiCandidates = ({
  newsApiUrl,
  jobApiUrl,
} = {}) => {
  const rawCandidates = [
    newsApiUrl,
    jobApiUrl,
    ...DEFAULT_NEWS_API_ORIGINS,
  ];

  return Array.from(
    new Set(rawCandidates.map(normalizeOrigin).filter(Boolean)),
  );
};

export const fetchFromNewsApi = async (
  path,
  init = {},
  {
    newsApiUrl = process.env.NEWS_API_URL,
    jobApiUrl = process.env.JOB_API_URL,
  } = {},
) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const candidates = getNewsApiCandidates({ newsApiUrl, jobApiUrl });

  let lastResponse = null;
  let lastError = null;

  for (const base of candidates) {
    try {
      const response = await fetch(`${base}${normalizedPath}`, init);
      if (response.ok) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError ?? new Error("Unable to reach News API");
};
