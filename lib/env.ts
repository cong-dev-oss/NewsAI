export const ENV = {
  // Main backend API for news, configs, categories, and auth (Server-side access)
  NEWS_API_URL: process.env.NEWS_API_URL || "http://127.0.0.1:8010",
  
  // Backend API for jobs, research and scheduler (Server-side access)
  JOB_API_URL: process.env.JOB_API_URL || "http://127.0.0.1:8000",
  
  // Shared API key for secure endpoints
  API_KEY: process.env.JOB_API_KEY || process.env.NEXT_PUBLIC_JOB_API_KEY || process.env.NEXT_PUBLIC_API_KEY || "my-secret-job-key-2026",
};

const isClient = typeof window !== "undefined";

/**
 * Returns the normalized News API URL with the `/api/v1` prefix.
 * Client-side: Returns relative `/api/v1` to utilize Next.js rewrites proxy.
 * Server-side: Returns absolute backend URL.
 */
export const getNewsApiV1 = () => {
  if (isClient) return "/api/v1";
  const base = ENV.NEWS_API_URL.replace(/\/+$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
};

/**
 * Returns the normalized Job API URL without trailing slashes.
 * Client-side: Returns relative `/job-api` to utilize Next.js rewrites proxy.
 * Server-side: Returns absolute backend URL.
 */
export const getJobApiBase = () => {
  return isClient ? "/job-api" : ENV.JOB_API_URL.replace(/\/+$/, "");
};
