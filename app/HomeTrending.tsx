import ArticleCardSmall from '@/components/ArticleCardSmall';
import { articles } from '@/lib/mockData';
import Link from 'next/link';

export default function HomeTrending() {
  const trending = articles.slice(10, 15);
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Đang được quan tâm</h2>
          </div>
          <div className="flex flex-col gap-0 divide-y divide-gray-100">
            {trending.map(article => (
              <ArticleCardSmall key={article.id} article={article} />
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-sm p-6 flex flex-col justify-between bg-gray-50">
          <div>
            <div className="w-8 h-8 flex items-center justify-center mb-4">
              <i className="ri-newspaper-line text-xl text-gray-400"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Khám phá theo chủ đề</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">Đọc bài viết từ các chủ đề bạn yêu thích mỗi ngày.</p>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {['Công nghệ · 427 bài', 'Kinh tế · 312 bài', 'Thể thao · 289 bài', 'Thế giới · 364 bài'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                {item}
              </div>
            ))}
          </div>
          <Link href="/categories" className="border border-gray-900 text-gray-900 font-medium text-sm px-4 py-2.5 text-center hover:bg-gray-900 hover:text-white transition-colors cursor-pointer whitespace-nowrap block">
            Xem tất cả chủ đề
          </Link>
        </div>
      </div>
    </section>
  );
}
