import { articles } from '@/lib/mockData';
import ArticleCard from '@/components/ArticleCard';
import FallbackImage from '@/components/FallbackImage';
import Link from 'next/link';

export default function FeaturedPage() {
  const hero = articles[0];
  const second = articles[1];
  const rest = articles.slice(2, 8);
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bài viết nổi bật</h1>
        <p className="text-sm text-gray-500">Những câu chuyện quan trọng được biên tập chọn lọc</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Link href={`/article/${hero.id}`} className="group relative overflow-hidden rounded-sm block cursor-pointer" style={{ minHeight: 380 }}>
          <FallbackImage src={hero.image} alt={hero.title} className="w-full h-full object-cover object-top absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2 block">{hero.category}</span>
            <h2 className="text-white font-bold text-xl leading-snug mb-2 group-hover:text-gray-200 transition-colors" style={{ fontFamily: "'Lora', serif" }}>{hero.title}</h2>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">{hero.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-gray-200 font-medium">{hero.author}</span>
              <span>·</span>
              <span>{hero.date}</span>
              <span>·</span>
              <span>{hero.readTime}</span>
            </div>
          </div>
        </Link>
        <Link href={`/article/${second.id}`} className="group relative overflow-hidden rounded-sm block cursor-pointer" style={{ minHeight: 380 }}>
          <FallbackImage src={second.image} alt={second.title} className="w-full h-full object-cover object-top absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2 block">{second.category}</span>
            <h2 className="text-white font-bold text-xl leading-snug mb-2 group-hover:text-gray-200 transition-colors" style={{ fontFamily: "'Lora', serif" }}>{second.title}</h2>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">{second.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-gray-200 font-medium">{second.author}</span>
              <span>·</span>
              <span>{second.date}</span>
            </div>
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Thêm bài nổi bật</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
