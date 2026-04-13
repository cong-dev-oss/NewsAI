'use client';
import Link from 'next/link';
import { useState } from 'react';

const footerLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Bài mới nhất', href: '/latest' },
  { label: 'Nổi bật', href: '/featured' },
  { label: 'Danh mục', href: '/categories' },
  { label: 'Việc làm IT', href: '/jobs' },
  { label: 'Xu hướng Tech', href: '/trends' },
];

export default function Footer() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    const body = new URLSearchParams({ email });
    await fetch('https://readdy.ai/api/form/d76bpn7lpdqvlupfpse0', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    setSubmitted(true);
  }

  return (
    <footer className="bg-[#0A0F1E] text-white pt-14 pb-8 mt-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30">
                D
              </span>
              <span className="font-black text-xl">
                Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Nhịp đập của cộng đồng Developer — tin tức, việc làm IT và xu hướng công nghệ mới nhất.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {['ri-github-fill', 'ri-twitter-x-fill', 'ri-facebook-fill'].map(icon => (
                <button key={icon} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className={icon}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Khám phá</p>
            <div className="flex flex-col gap-2.5">
              {footerLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Nhận bản tin</p>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Cập nhật xu hướng Tech và cơ hội việc làm IT hàng tuần ngay vào hộp thư của bạn.
            </p>
            {submitted ? (
              <p className="text-sm text-green-400 flex items-center gap-2">
                <i className="ri-checkbox-circle-line"></i> Cảm ơn bạn đã đăng ký!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@devpulse.vn"
                  required
                  className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600 text-white"
                />
                <button
                  type="submit"
                  className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  Đăng ký miễn phí
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600">
          <p>© 2026 DevPulse. Bảo lưu mọi quyền.</p>
          <p>Powered by AI · Smart Job Aggregator</p>
        </div>
      </div>
    </footer>
  );
}
