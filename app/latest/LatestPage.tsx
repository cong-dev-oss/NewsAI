'use client';
import { useState, useEffect } from 'react';
import { getArticles, getCategories } from '@/lib/api';
import { Article } from '@/lib/mockData';
import ArticleCard from '@/components/ArticleCard';

export default function LatestPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [categories, setCategories] = useState<{name: string}[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const catFilter = activeCategory === 'Tất cả' ? undefined : activeCategory;
    getArticles(30, catFilter).then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, [activeCategory]);

  const allCats = ['Tất cả', ...categories.map(c => c.name)];
  const filtered = articles;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Bài viết mới nhất</h1>
        <p className="text-sm text-gray-500">Cập nhật liên tục mọi tin tức nóng nhất trong ngày</p>
      </div>
      <div className="flex gap-2 flex-wrap mb-8">
        {allCats.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap border ${isActive ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span> bài viết
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <i className="ri-sort-desc"></i> Mới nhất
        </div>
      </div>
      
      {loading ? (
        <div className="py-20 text-center text-gray-400">Đang tải bài viết...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i className="ri-article-line text-4xl"></i>
          </div>
          <p className="text-base font-medium">Không có bài viết nào</p>
        </div>
      )}
    </div>
  );
}
