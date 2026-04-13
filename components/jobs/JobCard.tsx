'use client';
import { Job, jobApi } from '@/lib/jobApi';
import { useState } from 'react';

interface JobCardProps {
    job: Job;
    onUpdate?: () => void;
}

export default function JobCard({ job, onUpdate }: JobCardProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: 'mark_responded' | 'mark_ignored') => {
        try {
            setLoading(action);
            await jobApi.updateJobAction(job.id, action);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Action failed:", error);
            alert("Thao tác thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(null);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600 bg-green-50';
        if (score >= 75) return 'text-blue-600 bg-blue-50';
        return 'text-orange-600 bg-orange-50';
    };

    return (
        <div className="group relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            {/* Score Badge */}
            <div className={`absolute top-4 right-4 px-2 py-1 rounded-md text-xs font-bold ${getScoreColor(job.score)}`}>
                Match: {job.score}%
            </div>

            <div className="mb-4">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-600 mb-2">
                    {job.job_type} • {job.job_category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                        {job.title}
                    </a>
                </h3>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <i className="ri-map-pin-2-line"></i> {job.location || job.region}
                </p>
            </div>

            <div className="mb-4 h-16 overflow-hidden">
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {job.summary}
                </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
                {job.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-500 text-[11px] rounded-md border border-gray-100">
                        {skill}
                    </span>
                ))}
                {job.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[11px] rounded-md">
                        +{job.skills.length - 4}
                    </span>
                )}
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-indigo-600">
                    {job.salary || "Thỏa thuận"}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleAction('mark_ignored')}
                        disabled={!!loading}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Bỏ qua"
                    >
                        {loading === 'mark_ignored' ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-eye-off-line"></i>}
                    </button>
                    <button 
                        onClick={() => handleAction('mark_responded')}
                        disabled={!!loading}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        title="Đã nộp"
                    >
                        {loading === 'mark_responded' ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-checkbox-circle-line"></i>}
                    </button>
                    <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-indigo-100 flex items-center gap-1"
                    >
                        Chi tiết <i className="ri-arrow-right-up-line"></i>
                    </a>
                </div>
            </div>
        </div>
    );
}
