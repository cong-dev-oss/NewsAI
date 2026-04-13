import { ENV, getJobApiBase } from './env';

export interface Job {
    id: string | number;
    title: string;
    url: string;
    summary: string;
    score: number;
    region: string;
    job_category: string;
    job_type: string;
    location: string;
    salary: string;
    requirements: string;
    skills: string[];
    status?: string;
    created_at?: string;
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
        ...options.headers,
        "X-Job-API-Key": ENV.API_KEY,
        "Content-Type": "application/json",
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || "API Request failed");
    }
    return res.json();
};

const normalizeJob = (job: any): Job => ({
    id: job.id ?? job.job_id,
    title: job.title ?? "",
    url: job.url ?? "#",
    summary: job.summary ?? "",
    score: Number(job.score ?? 0),
    region: job.region ?? "",
    job_category: job.job_category ?? "",
    job_type: job.job_type ?? "",
    location: job.location ?? "",
    salary: job.salary ?? "",
    requirements: job.requirements ?? "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    status: job.status,
    created_at: job.created_at,
});

export const jobApi = {
    getJobs: async (filters: {
        region?: string;
        category?: string;
        job_type?: string;
        location?: string;
        skills?: string;
    }): Promise<Job[]> => {
        const url = new URL(`${getJobApiBase()}/v1/jobs`);
        Object.entries(filters).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });
        const data = await fetchWithAuth(url.toString());
        const items = Array.isArray(data) ? data : data?.jobs;
        return Array.isArray(items) ? items.map(normalizeJob) : [];
    },

    getSummaryFeed: async (): Promise<Job[]> => {
        const data = await fetchWithAuth(`${getJobApiBase()}/v1/jobs/summary-feed`);
        const items = Array.isArray(data) ? data : data?.jobs;
        return Array.isArray(items) ? items.map(normalizeJob) : [];
    },

    updateJobAction: async (jobId: string | number, action: "mark_responded" | "mark_ignored" | "mark_new") => {
        return fetchWithAuth(`${getJobApiBase()}/v1/jobs/${jobId}/actions`, {
            method: "POST",
            body: JSON.stringify({ action }),
        });
    },

    runHarvest: async (profile: string, topic: string) => {
        return fetchWithAuth(`${getJobApiBase()}/v1/harvest/run`, {
            method: "POST",
            body: JSON.stringify({ profile, topic }),
        });
    }
};
