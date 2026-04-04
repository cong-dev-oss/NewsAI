import { Article } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const mapArticle = (a: any): Article => ({
    id: a.id.toString(),
    url: a.url,
    title: a.title,
    excerpt: a.summary || a.description || (a.content ? a.content.substring(0, 150) + "..." : ""),
    category: a.category || "General",
    categoryColor: "#333", // Default color
    author: a.source?.name || "AI Aggregator",
    authorInitials: a.source?.name ? a.source.name.substring(0, 2).toUpperCase() : "AI",
    date: a.published_at ? new Date(a.published_at).toLocaleDateString('vi-VN') : new Date(a.processed_at).toLocaleDateString('vi-VN'),
    readTime: "3 min read", // Mocked read time
    image: a.image_url || "https://images.unsplash.com/photo-1585829365234-781fcdad4372?q=80&w=800&auto=format&fit=crop",
    featured: false,
    summary: a.summary || "",
    content: a.content || "",
    audio_url: a.audio_url || undefined
});

export const getArticles = async (limit: number = 10, category?: string, is_processed: boolean = true): Promise<Article[]> => {
    try {
        const url = new URL(`${API_BASE_URL}/articles/`);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('is_processed', is_processed.toString());
        if (category) {
            url.searchParams.append('category', category);
        }
        
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data.map(mapArticle) : [];
    } catch (error) {
        console.error("Fetch articles error:", error);
        return [];
    }
};

export const getAllArticles = async (limit: number = 100): Promise<any[]> => {
    try {
        const url = new URL(`${API_BASE_URL}/articles/`);
        url.searchParams.append('limit', limit.toString());

        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Fetch all articles error:", error);
        return [];
    }
};

export const getArticleById = async (id: string | number): Promise<Article | null> => {
    try {
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return mapArticle(data);
    } catch (error) {
        console.error("Fetch article error:", error);
        return null;
    }
};

export const getCategories = async (): Promise<{name: string, count: number}[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/articles/categories`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("Fetch categories error:", error);
        return [];
    }
};

export const api = {
    // Articles
    getArticles,
    getAllArticles,
    getArticleById,
    getCategories,
    deleteArticle: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Delete article failed');
        }
        return data;
    },
    bulkDeleteArticles: async (ids: number[]) => {
        const res = await fetch(`${API_BASE_URL}/articles/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Bulk delete articles failed');
        }
        return data;
    },

    // Sources
    getSources: () => fetch(`${API_BASE_URL}/sources/`).then(res => res.json()),
    createSource: (data: any) => fetch(`${API_BASE_URL}/sources/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    
    // Topics
    getTopics: () => fetch(`${API_BASE_URL}/sources/topics`).then(res => res.json()),
    createTopic: (data: any) => fetch(`${API_BASE_URL}/sources/topics`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteTopic: async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/sources/topics/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Delete topic failed');
        }
        return data;
    },
    
    // Configs
    getConfigs: () => fetch(`${API_BASE_URL}/sources/configs`).then(res => res.json()),
    createConfig: (data: any) => fetch(`${API_BASE_URL}/sources/configs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateConfig: (id: number, data: any) => fetch(`${API_BASE_URL}/sources/configs/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    
    // History
    getHistory: () => fetch(`${API_BASE_URL}/history/`).then(res => res.json()),
    
    // Automation
    triggerAll: () => fetch(`${API_BASE_URL}/sources/trigger-all`, { method: 'POST' }).then(res => res.json()),
};
