'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Finding, researchApi } from '@/lib/researchApi';

const PROFILES = [
    {
        id: 'all',
        label: 'Tất cả',
        icon: '⚡',
        skills: '',
        color: 'from-violet-600 to-indigo-600',
    },
    {
        id: 'dotnet',
        label: '.NET & C#',
        icon: '🔷',
        skills: '.NET,C#,ASP.NET',
        color: 'from-blue-600 to-sky-500',
    },
    {
        id: 'react',
        label: 'React & Frontend',
        icon: '⚛️',
        skills: 'React,Next.js,TypeScript,Vite',
        color: 'from-cyan-500 to-teal-500',
    },
    {
        id: 'php',
        label: 'PHP & Laravel',
        icon: '🐘',
        skills: 'PHP,Laravel',
        color: 'from-purple-600 to-pink-500',
    },
    {
        id: 'ai',
        label: 'AI & Dev Tools',
        icon: '🤖',
        skills: 'AI,GitHub Copilot,Cursor',
        color: 'from-orange-500 to-amber-400',
    },
    {
        id: 'design',
        label: 'Design & Figma',
        icon: '🎨',
        skills: 'Figma,AI Design,UI/UX',
        color: 'from-rose-500 to-pink-500',
    },
];

const getSourceColor = (source: string) => {
    const map: Record<string, string> = {
        reddit: 'bg-orange-50 text-orange-700 border-orange-200',
        hackernews: 'bg-amber-50 text-amber-700 border-amber-200',
        youtube: 'bg-red-50 text-red-700 border-red-200',
        web: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[source.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200';
};

function TrendCard({ item, index }: { item: Finding; index: number }) {
    const isHot = item.relevance_score >= 0.85;
    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-black text-xl w-7 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    {isHot && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200 uppercase tracking-wider">
                            🔥 Hot
                        </span>
                    )}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${getSourceColor(item.source)}`}>
                    {item.source}
                </span>
            </div>

            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                {item.title}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                {item.content}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-gray-50">
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[11px] rounded-md border border-gray-100 uppercase">
                    by: {item.author || "Community"}
                </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1 font-mono">
                    <i className="ri-fire-fill text-orange-400"></i> Score: {item.engagement_score.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                    Chi tiết <i className="ri-arrow-right-up-line"></i>
                </span>
            </div>
        </a>
    );
}

export default function TrendsPage() {
    const [items, setItems] = useState<Finding[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeProfile, setActiveProfile] = useState('all');

    const fetchTrends = useCallback(async () => {
        try {
            setLoading(true);
            const profile = PROFILES.find(p => p.id === activeProfile);
            let data: Finding[] = [];

            if (!profile || activeProfile === 'all') {
                const res = await researchApi.getTopFindings({ limit: 30 });
                data = Array.isArray(res) ? res : res.findings || [];
            } else {
                // Determine a concise topic term from the profile's first skill
                const topicKeyword = profile.skills.split(',')[0].trim();
                const res = await researchApi.getFindings({
                    topic: topicKeyword,
                    limit: 30
                });
                data = res.findings || [];
            }
            setItems(data);
        } catch (error) {
            console.error("Fetch trends error:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [activeProfile]);

    useEffect(() => {
        fetchTrends();
    }, [fetchTrends]);

    const activeProfileData = PROFILES.find(p => p.id === activeProfile) || PROFILES[0];

    return (
        <div className="min-h-screen bg-[#0A0F1E]">
            <Header />

            {/* Dark Hero */}
            <section className="relative overflow-hidden bg-[#0A0F1E] py-16 px-6">
                {/* Background glow blobs */}
                <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-700/20 blur-[120px]" />
                <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-700/20 blur-[100px]" />

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Cập nhật mới nhất · Live Feed
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-5 leading-none tracking-tight">
                        Xu Hướng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Công Nghệ</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Tổng hợp các chủ đề đang <strong className="text-white">HOT</strong> nhất từ cộng đồng Dev toàn cầu — Reddit, HackerNews, Discord và hơn thế nữa.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {PROFILES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActiveProfile(p.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer border ${
                                    activeProfile === p.id
                                        ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-lg shadow-black/30`
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span>{p.icon}</span> {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-[#F9FAFB] rounded-t-[2.5rem] min-h-screen px-6 py-12">
                <div className="max-w-6xl mx-auto">

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <span>{activeProfileData.icon}</span>
                                {activeProfileData.id === 'all' ? 'Tất cả xu hướng mới nhất' : `Xu hướng: ${activeProfileData.label}`}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {items.length} chủ đề đang được cộng đồng thảo luận sôi nổi
                            </p>
                        </div>
                        <button
                            onClick={fetchTrends}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:shadow-sm transition-all font-medium cursor-pointer"
                        >
                            <i className="ri-refresh-line"></i> Làm mới
                        </button>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                                <div key={i} className="h-52 bg-gray-200 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item, i) => (
                                <TrendCard key={item.finding_id} item={item} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="text-5xl mb-4">🛰️</div>
                            <h3 className="text-xl font-bold text-gray-800">Chưa có xu hướng nào</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                Hệ thống đang cào dữ liệu. Quay lại sau vài phút nhé!
                            </p>
                            <button
                                onClick={fetchTrends}
                                className="mt-6 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
