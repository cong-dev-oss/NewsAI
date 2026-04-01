'use client';
import { useState, useEffect } from 'react';

const defaultBreakingNews = [
  "🔴 BREAKING: Hội nghị G20 đạt thỏa thuận lịch sử về biến đổi khí hậu toàn cầu",
  "⚡ Kinh tế Việt Nam tăng trưởng 8.2% trong quý I/2026, dẫn đầu Đông Nam Á",
  "🏆 Real Madrid vô địch Champions League lần thứ 16 sau trận chung kết kịch tính",
  "🚀 NASA xác nhận sự hiện diện của nước lỏng dưới bề mặt sao Hỏa",
];

export default function HomeBreaking({ news }: { news?: string[] }) {
  const [current, setCurrent] = useState(0);
  const displayNews = news || defaultBreakingNews;

  useEffect(() => {
    if (displayNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % displayNews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayNews]);

  if (displayNews.length === 0) return null;

  return (
    <div className="w-full bg-red-600">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-4">
        <span className="bg-white text-red-600 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 animate-pulse">
          NÓNG
        </span>
        <div className="overflow-hidden flex-1">
          <p className="text-white text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {displayNews[current]}
          </p>
        </div>
        <div className="hidden sm:flex gap-1.5 flex-shrink-0">
          {displayNews.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${i === current ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
