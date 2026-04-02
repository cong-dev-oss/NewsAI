'use client';
import { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticles } from '@/lib/api';
import { Article } from '@/lib/mockData';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles(20, decodedName).then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, [decodedName]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 block">Chuyên mục</span>
            <h1 className="text-3xl font-bold text-gray-900">{decodedName}</h1>
          </div>
          <Link href="/categories" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            Xem tất cả chuyên mục <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Đang tải bài viết...</div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <i className="ri-inbox-line text-4xl mb-4 block"></i>
            Chuyên mục này hiện chưa có bài viết nào.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
