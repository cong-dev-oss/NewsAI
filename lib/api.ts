import { Article } from './mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export async function getArticles(limit = 10, category?: string): Promise<Article[]> {
  try {
    const url = new URL(`${API_BASE_URL}/articles/`);
    url.searchParams.append('limit', limit.toString());
    if (category) url.searchParams.append('category', category);
    
    const response = await fetch(url.toString(), {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    
    const data = await response.json();
    
    // Mapping từ data Backend sang interface Article của App
    return data.map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      excerpt: item.summary || item.description || "Đang cập nhật tóm tắt...",
      category: item.source?.name || "Tin tức",
      categoryColor: "#2563EB", // Mặc định
      author: "News AI",
      authorInitials: "AI",
      date: new Date(item.processed_at).toLocaleDateString('vi-VN'),
      readTime: "2 phút đọc",
      image: item.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000",
      featured: item.is_processed,
      tags: []
    }));
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getArticleById(id: string): Promise<(Article & { content?: string, summary?: string }) | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const item = await response.json();
    
    return {
      id: item.id.toString(),
      title: item.title,
      content: item.content,
      summary: item.summary,
      excerpt: item.summary || item.description || "Đang cập nhật tóm tắt...",
      category: item.source?.name || "Tin tức",
      categoryColor: "#2563EB",
      author: "News AI",
      authorInitials: "AI",
      date: new Date(item.processed_at).toLocaleDateString('vi-VN'),
      readTime: "2 phút đọc",
      image: item.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000",
      featured: item.is_processed,
      tags: []
    };
  } catch (error) {
    console.error("Error fetching article by id:", error);
    return null;
  }
}

export async function getCategories(): Promise<{ name: string, count: number }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/categories`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
