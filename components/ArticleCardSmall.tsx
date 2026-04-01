import Link from 'next/link';
import CategoryBadge from './CategoryBadge';
import { Article } from '@/lib/mockData';

export default function ArticleCardSmall({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="group flex gap-3 items-start cursor-pointer hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
      <div className="w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <CategoryBadge name={article.category} color={article.categoryColor} />
        <p className="text-sm font-semibold text-gray-800 leading-snug mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </p>
        <span className="text-xs text-gray-400 mt-1 block">{article.date} · {article.readTime}</span>
      </div>
    </Link>
  );
}
