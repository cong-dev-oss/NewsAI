import Link from 'next/link';
import { Article } from '@/lib/mockData';
import FallbackImage from '@/components/FallbackImage';

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  return (
    <Link href={`/article/${article.id}`} className="group block cursor-pointer">
      <div className="w-full h-48 overflow-hidden mb-4">
        <FallbackImage src={article.image} alt={article.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex items-center justify-between">
         <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{article.category || "story"}</span>
         {article.audio_url && <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">🎙️ Có Giọng Đọc</span>}
      </div>
      <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mt-2 mb-2 group-hover:text-gray-500 transition-colors">
        {article.title}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">{article.excerpt}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-gray-500">{article.author}</span>
        <span>·</span>
        <span>{article.date}</span>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
    </Link>
  );
}
