'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    const body = new URLSearchParams({ email });
    await fetch('https://readdy.ai/api/form/d76bpn7lpdqvlupfpse0', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    setSubmitted(true);
  }

  return (
    <footer className="border-t border-gray-200 bg-white pt-12 pb-8 mt-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-gray-100">
          <div>
            <span className="font-['Pacifico'] text-xl text-gray-900">Báo Đọc</span>
            <p className="text-sm text-gray-400 leading-relaxed mt-3">Tin tức nhanh, chính xác và đáng tin cậy. Cập nhật mọi lúc, mọi nơi.</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Khám phá</p>
            {[['Trang chủ', '/'], ['Bài mới nhất', '/latest'], ['Nổi bật', '/featured'], ['Danh mục', '/categories']].map(([label, href]) => (
              <Link key={href} href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">{label}</Link>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Nhận bản tin</p>
            {submitted ? (
              <p className="text-sm text-gray-500 flex items-center gap-2"><i className="ri-checkbox-circle-line text-green-500"></i> Cảm ơn bạn đã đăng ký!</p>
            ) : (
              <form data-readdy-form id="newsletter-footer" onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" required className="text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400" />
                <button type="submit" className="text-sm font-medium border border-gray-900 bg-gray-900 text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
                  Đăng ký
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-xs text-gray-400">
          <p>© 2026 Báo Đọc. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            {['ri-facebook-fill', 'ri-twitter-x-fill', 'ri-instagram-line'].map(icon => (
              <button key={icon} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                <i className={icon}></i>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
