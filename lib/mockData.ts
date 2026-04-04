export interface Article {
  id: string;
  url: string; // Thêm url bài viết gốc
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  author: string;
  authorInitials: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags?: string[];
  summary?: string;
  content?: string;
  audio_url?: string;
}

export const categories = [
  { name: "Thế giới", slug: "the-gioi", color: "#2563EB", bg: "#EFF6FF", icon: "ri-global-line", count: 248 },
  { name: "Chính trị", slug: "chinh-tri", color: "#7C3AED", bg: "#F5F3FF", icon: "ri-government-line", count: 183 },
  { name: "Kinh tế", slug: "kinh-te", color: "#059669", bg: "#ECFDF5", icon: "ri-line-chart-line", count: 312 },
  { name: "Công nghệ", slug: "cong-nghe", color: "#0EA5E9", bg: "#F0F9FF", icon: "ri-cpu-line", count: 427 },
  { name: "Thể thao", slug: "the-thao", color: "#EA580C", bg: "#FFF7ED", icon: "ri-football-line", count: 395 },
  { name: "Văn hóa", slug: "van-hoa", color: "#DB2777", bg: "#FDF2F8", icon: "ri-music-line", count: 156 },
  { name: "Sức khỏe", slug: "suc-khoe", color: "#16A34A", bg: "#F0FDF4", icon: "ri-heart-pulse-line", count: 201 },
  { name: "Khoa học", slug: "khoa-hoc", color: "#9333EA", bg: "#FAF5FF", icon: "ri-flask-line", count: 134 },
];

export const articles: Article[] = [];

export const featuredArticles = articles.filter(a => a.featured);
export const latestArticles = [...articles].sort((a, b) => b.id.localeCompare(a.id));
