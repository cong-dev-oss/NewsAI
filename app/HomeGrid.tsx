import ArticleCard from '@/components/ArticleCard';
import { getArticles } from '@/lib/api';
import Link from 'next/link';

export default async function HomeGrid() {
  const data = await getArticles(10);

  if (data.length <= 4) return null; // Ẩn grid nếu không có bài mới hơn top 4

  const gridArticles = data.slice(4, 10);
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Bài viết mới nhất</h2>
        <Link href="/latest" className="text-xs text-gray-400 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1">
          Xem tất cả <i className="ri-arrow-right-line"></i>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {gridArticles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
