import { getCategories } from '@/lib/api';
import Link from 'next/link';

export default async function HomeCategoriesSection() {
  const dynamicCategories = await getCategories();
  
  if (dynamicCategories.length === 0) return null; // Ẩn hoàn toàn section nếu không có dữ liệu
  return (
    <section className="border-t border-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest">Chủ đề</h2>
          <Link href="/categories" className="text-xs text-gray-400 hover:text-gray-900 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1">
            Tất cả chủ đề <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {dynamicCategories.map(cat => (
            <Link key={cat.name} href={`/categories/${cat.name}`} className="group flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 hover:border-gray-900 transition-colors cursor-pointer">
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
