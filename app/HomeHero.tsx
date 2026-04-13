import Link from 'next/link';
import { getArticles } from '@/lib/api';
import FallbackImage from '@/components/FallbackImage';

export default async function HomeHero() {
  const data = await getArticles(4);
  
  if (data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-gray-400">
        <i className="ri-newspaper-line text-4xl mb-4 block"></i>
        Đang cập nhật tin tức mới nhất từ hệ thống AI...
      </div>
    );
  }

  const hero = data[0];
  const secondary = data.slice(1, 4);

  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-2">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-base font-bold uppercase tracking-widest text-gray-900">Spotlight</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <Link href={`/article/${hero.id}`} className="lg:col-span-3 group cursor-pointer block">
          <div className="w-full h-72 lg:h-96 overflow-hidden rounded-sm mb-5">
            <FallbackImage src={hero.image} alt={hero.title} className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-700" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{hero.category}</span>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mt-2 mb-3 group-hover:text-gray-600 transition-colors">
            {hero.title}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{hero.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-gray-600 font-medium">{hero.author}</span>
            <span>·</span>
            <span>{hero.date}</span>
            <span>·</span>
            <span>{hero.readTime}</span>
          </div>
        </Link>
        <div className="lg:col-span-2 flex flex-col divide-y divide-gray-100">
          {secondary.map(article => (
            <Link key={article.id} href={`/article/${article.id}`} className="group flex gap-4 py-5 first:pt-0 cursor-pointer">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{article.category}</span>
                <h3 className="text-sm font-bold text-gray-900 leading-snug mt-1.5 line-clamp-3 group-hover:text-gray-500 transition-colors">
                  {article.title}
                </h3>
                <span className="text-xs text-gray-400 mt-2 block">{article.date}</span>
              </div>
              <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-sm">
                <FallbackImage src={article.image} alt={article.title} className="w-full h-full object-cover object-top" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
