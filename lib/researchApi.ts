import { ENV, getJobApiBase } from './env';

export interface Finding {
    finding_id: string;
    run_id: string;
    topic: string;
    source: string;
    title: string;
    url: string;
    author: string;
    content: string;
    engagement_score: number;
    relevance_score: number;
    published_at?: string;
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

export const researchApi = {
    getFindings: async (filters: {
        run_id?: string;
        topic?: string;
        source?: string;
        min_engagement?: number;
        limit?: number;
    }): Promise<{ total: number; findings: Finding[] }> => {
        const url = new URL(`${getJobApiBase()}/v1/findings`);
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") url.searchParams.append(key, String(value));
        });
        return fetchWithAuth(url.toString());
    },

    getTopFindings: async (filters: {
        source?: string;
        limit?: number;
    } = {}): Promise<{ total: number; findings: Finding[] } | Finding[]> => {
        const url = new URL(`${getJobApiBase()}/v1/findings/top`);
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== "") url.searchParams.append(key, String(value));
        });
        const res = await fetchWithAuth(url.toString());
        // Handling both possible response shapes: direct array or nested object
        if (Array.isArray(res)) return res;
        return res;
    },

    getFindingsBySource: async (topic?: string) => {
        const url = new URL(`${getJobApiBase()}/v1/findings/by-source`);
        if (topic) url.searchParams.append('topic', topic);
        return fetchWithAuth(url.toString());
    },

    runResearch: async (topic: string, sources: string = "reddit,hn,youtube,web", depth: string = "quick") => {
        return fetchWithAuth(`${getJobApiBase()}/v1/research/run`, {
            method: "POST",
            body: JSON.stringify({ topic, sources, depth }),
        });
    }
};
