import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { articles as mockArticles } from '@/lib/mockData';
import { getArticleById, getArticles } from '@/lib/api';
import Link from 'next/link';

export async function generateStaticParams() {
  const latestArticles = await getArticles(100);
  if (latestArticles.length === 0) {
    return mockArticles.map(a => ({ id: a.id }));
  }
  return latestArticles.map(a => ({ id: a.id }));
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const realArticle = await getArticleById(resolvedParams.id);
  
  if (!realArticle) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
           <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-10 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Quay lại trang chủ
          </Link>
          <div className="text-gray-400">Không tìm thấy bài viết hoặc bài viết đang trong quá trình xử lý AI...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const article = realArticle;
  const related = mockArticles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-10 cursor-pointer transition-colors">
          <i className="ri-arrow-left-line"></i> Quay lại trang chủ
        </Link>
        
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{article.category}</span>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mt-3 mb-5" style={{ fontFamily: "'Lora', serif" }}>{article.title}</h1>
        
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="font-medium text-gray-600">{article.author}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>

        {/* AI Summary Box */}
        {article.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-10 rounded-r-md">
            <h4 className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <i className="ri-robot-line"></i> Tóm tắt bởi AI
            </h4>
            <p className="text-gray-700 text-base italic leading-relaxed">
              "{article.summary}"
            </p>
          </div>
        )}

        <div className="w-full h-80 lg:h-[450px] overflow-hidden mb-10 rounded-sm">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover object-center" />
        </div>

        <div className="text-gray-700 whitespace-pre-wrap">
          {realArticle?.content ? (
            <div className="prose prose-lg max-w-none text-gray-700 leading-loose" style={{ fontFamily: "'Lora', serif" }}>
              {realArticle.content.split('\n').map((p, i) => (
                <p key={i} className="mb-6">{p}</p>
              ))}
            </div>
          ) : (
            <>
              <p className="text-xl leading-relaxed text-gray-700 mb-8 font-normal" style={{ fontFamily: "'Lora', serif" }}>{article.excerpt}</p>
              <p className="mb-6 text-base leading-loose text-gray-600">Đây là bài viết chi tiết được nạp từ dữ liệu mẫu phục vụ mục đích kiểm thử giao diện.</p>
            </>
          )}

          {/* Link to original source */}
          <div className="mt-8 mb-4">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="ri-external-link-line"></i> Xem bài viết gốc tại nguồn
            </a>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-100">
              {article.tags.map(tag => (
                <span key={tag} className="text-xs text-gray-500 border border-gray-200 px-3 py-1">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-14 pt-8 border-t border-gray-200">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Bài viết liên quan</h3>
            <div className="flex flex-col divide-y divide-gray-100">
              {related.map(a => (
                <Link key={a.id} href={`/article/${a.id}`} className="group flex gap-4 py-5 first:pt-0 cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{a.category}</span>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 mt-1.5 group-hover:text-gray-500 transition-colors leading-snug">{a.title}</p>
                    <span className="text-xs text-gray-400 mt-1.5 block">{a.date} · {a.readTime}</span>
                  </div>
                  <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded-sm">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover object-center" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
