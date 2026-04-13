import ArticleCard from '@/components/ArticleCard';
import { getArticles } from '@/lib/api';

export default async function HomeSituation() {
  const allData = await getArticles(30);
  
  // Lọc lấy các bài Tóm Tắt Tình Hình (thuộc nhóm Tình Hình)
  const situationArticles = allData.filter(a => a.category.toLowerCase().startsWith('tình hình'));

  if (situationArticles.length === 0) return null;

  return (
    <section className="bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
               🎙️ Radar
            </h2>
            <p className="text-slate-500 text-sm mt-1">Điểm nhanh các diễn biến đáng chú ý được hệ thống AI tổng hợp.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {situationArticles.slice(0, 3).map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
