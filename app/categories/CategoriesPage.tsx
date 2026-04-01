'use client';
import { useState, useEffect } from 'react';
import { getCategories, getArticles } from '@/lib/api';
import { Article } from '@/lib/mockData';
import ArticleCard from '@/components/ArticleCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(data => {
      setCategories(data);
      if (data.length > 0) setSelected(data[0].name);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      getArticles(20, selected).then(setFiltered);
    }
  }, [selected]);

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-20 text-center">Đang tải danh mục...</div>;
  if (categories.length === 0) return <div className="max-w-6xl mx-auto px-6 py-20 text-center">Chưa có bài viết nào được phân loại.</div>;

  const active = categories.find(c => c.name === selected) || categories[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Danh mục chủ đề</h1>
        <p className="text-sm text-gray-500">Chọn chủ đề bạn quan tâm để đọc bài viết liên quan</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelected(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap ${selected === cat.name ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            {cat.name}
            <span className={`text-xs ${selected === cat.name ? 'text-gray-300' : 'text-gray-400'}`}>{cat.count}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">{active.name}</h2>
        <span className="text-sm text-gray-400">— {active.count} bài viết</span>
      </div>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <i className="ri-newspaper-line text-3xl text-gray-300"></i>
          </div>
          <p className="text-sm text-gray-400">Đang cập nhật bài viết cho chuyên mục này</p>
        </div>
      )}
    </div>
  );
}
