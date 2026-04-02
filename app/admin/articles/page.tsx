"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Search, 
  ExternalLink, 
  Eye, Calendar,
  MoreHorizontal, RefreshCw,
  FileText,
  Clock,
  ArrowUpRight
} from "lucide-react";

export default function ArticlesManagementPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Articles Explorer</h1>
          <p className="text-zinc-500 mt-1">Review and audit all AI-processed content across your network.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by title or summary content..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
             onClick={fetchArticles}
             className="p-2 bg-white text-zinc-600 rounded-md hover:bg-zinc-50 transition border border-zinc-200 shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="py-32 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-sm font-medium">
                Syncing with master database...
             </div>
        ) : filteredArticles.length === 0 ? (
            <div className="py-32 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 space-y-3">
                <FileText size={48} className="mx-auto opacity-10 mb-4" />
                <p className="font-bold text-zinc-900">No articles found</p>
                <p className="text-xs max-w-xs mx-auto">Try a different search query or check if your automation pipelines are currently active.</p>
            </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <tr>
                        <th className="px-6 py-4">Title & Source</th>
                        <th className="px-6 py-4">Processing Context</th>
                        <th className="px-6 py-4">Result State</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {filteredArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td className="px-6 py-5 max-w-md">
                                <div className="space-y-1.5">
                                    <h3 className="font-semibold text-zinc-900 leading-tight group-hover:text-zinc-600 transition-colors line-clamp-1">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <a href={article.url} target="_blank" className="text-[11px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors">
                                            Original URL <ArrowUpRight size={10} />
                                        </a>
                                        <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                            <Clock size={10} />
                                            {new Date(article.processed_at).toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-tight">
                                    Pipeline #{article.config_id}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${
                                    article.status === 'COMPLETED' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                    {article.status}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-100 border border-transparent hover:border-zinc-200 rounded-lg shadow-sm">
                                        <Eye size={16} />
                                    </button>
                                    <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors bg-white hover:bg-zinc-100 border border-transparent hover:border-zinc-200 rounded-lg shadow-sm">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
