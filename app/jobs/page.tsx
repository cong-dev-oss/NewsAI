'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobCard from '@/components/jobs/JobCard';
import { Job, jobApi } from '@/lib/jobApi';

type JobFilter = {
    category?: 'dev' | 'designer';
    job_type?: 'fulltime' | 'freelance' | 'remote';
    region?: string;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<JobFilter>({ category: 'dev', job_type: 'fulltime' });
    const [activeTab, setActiveTab] = useState<'dev' | 'designer'>('dev');
    const [activeType, setActiveType] = useState<'fulltime' | 'freelance' | 'remote'>('fulltime');

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await jobApi.getJobs({
                category: activeTab,
                job_type: activeType,
                region: 'VN'
            });
            setJobs(data);
        } catch (error) {
            console.error("Fetch jobs error:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, activeType]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const categories = [
        { id: 'dev', label: 'Lập trình viên', icon: 'ri-code-s-slash-line' },
        { id: 'designer', label: 'Thiết kế (Designer)', icon: 'ri-palette-line' },
    ];

    const jobTypes = [
        { id: 'fulltime', label: 'Full-time' },
        { id: 'freelance', label: 'Freelance' },
        { id: 'remote', label: 'Remote / Quốc tế' },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Cơ Hội <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Nghề Nghiệp</span> Mới
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Khám phá các công việc IT và Design được chọn lọc kỹ càng từ Smart Job Aggregator.
                    </p>
                </div>

                {/* Filters / Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id as any)}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === cat.id 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className={cat.icon}></i> {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {jobTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveType(type.id as any)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                    activeType === type.id
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} onUpdate={fetchJobs} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <i className="ri-search-eye-line text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Không tìm thấy công việc nào</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Thử đổi bộ lọc hoặc quay lại sau khi chúng tôi cập nhật tin mới nhé.
                        </p>
                        <button 
                            onClick={fetchJobs}
                            className="mt-6 px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Làm mới dữ liệu
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
