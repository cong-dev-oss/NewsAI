"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Plus, Settings, 
  Trash2, Save, 
  PlusCircle, 
  Globe, Tags, 
  CalendarClock,
  ExternalLink
} from "lucide-react";

export default function ConfigsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSource, setNewSource] = useState({ name: "", base_url: "" });
  const [newTopic, setNewTopic] = useState({ name: "" });
  const [newConfig, setNewConfig] = useState({ 
    source_id: "", 
    topic_id: "", 
    url: "", 
    cron_config: "0 15 * * *", 
    article_limit: 5 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, c] = await Promise.all([
          api.getSources(),
          api.getTopics(),
          api.getConfigs()
        ]);
        setSources(s);
        setTopics(t);
        setConfigs(c);
        setLoading(false);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSource(newSource);
    setSources(await api.getSources());
    setNewSource({ name: "", base_url: "" });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createTopic(newTopic);
    setTopics(await api.getTopics());
    setNewTopic({ name: "" });
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createConfig({
        ...newConfig,
        source_id: parseInt(newConfig.source_id),
        topic_id: parseInt(newConfig.topic_id),
        article_limit: parseInt(newConfig.article_limit.toString())
    });
    setConfigs(await api.getConfigs());
    setNewConfig({ source_id: "", topic_id: "", url: "", cron_config: "0 15 * * *", article_limit: 5 });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản Lý Cấu Hình</h1>
          <p className="text-slate-500">Thiết lập nguồn báo, chủ đề và lịch trình tự động</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TOPIC & SOURCE SECTION */}
        <div className="space-y-8">
          {/* Add Source Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Globe size={20} className="text-indigo-600"/> Thêm Nguồn Báo</h2>
            <form onSubmit={handleCreateSource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Tên (e.g. VNExpress)" 
                className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})}
              />
              <input 
                placeholder="Base URL (e.g. https://vnexpress.net)" 
                className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={newSource.base_url} onChange={e => setNewSource({...newSource, base_url: e.target.value})}
              />
              <button type="submit" className="md:col-span-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 font-medium transition flex items-center justify-center gap-2">
                <Plus size={18}/> Thêm Nguồn
              </button>
            </form>
          </div>

          {/* Add Topic Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Tags size={20} className="text-indigo-600"/> Thêm Chủ Đề</h2>
            <form onSubmit={handleCreateTopic} className="flex gap-4">
              <input 
                placeholder="Chủ đề (e.g. Kinh doanh, Công nghệ)" 
                className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={newTopic.name} onChange={e => setNewTopic({...newTopic, name: e.target.value})}
              />
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-medium transition flex items-center gap-2 whitespace-nowrap">
                <Plus size={18}/> Thêm
              </button>
            </form>
          </div>
        </div>

        {/* RECENT LISTS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 overflow-hidden">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700 underline underline-offset-8 decoration-indigo-200">
             Danh sách đã thiết lập
          </h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nguồn hiện có</h3>
            <div className="flex flex-wrap gap-2">
              {sources.map(s => (
                <span key={s.id} className="bg-white border-2 border-slate-50 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-2 hover:border-indigo-100 transition shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span> {s.name}
                </span>
              ))}
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6">Chủ đề hiện có</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <span key={t.id} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-indigo-100 shadow-sm">
                  #{t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE DYNAMIC CONFIGURATION (CRON) */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><CalendarClock size={24} className="text-indigo-600"/> Lập Lịch Tự Động (CronJob)</h2>
        
        <form onSubmit={handleCreateConfig} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 ml-1">Chọn Nguồn</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm"
              value={newConfig.source_id} onChange={e => setNewConfig({...newConfig, source_id: e.target.value})}
            >
              <option value="">-- Chọn Nguồn --</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 ml-1">Chọn Chủ Đề</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm"
              value={newConfig.topic_id} onChange={e => setNewConfig({...newConfig, topic_id: e.target.value})}
            >
              <option value="">-- Chọn Chủ Đề --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 ml-1">URL Chuyên Mục (ví dụ .../kinh-doanh)</label>
            <input 
               className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm"
               value={newConfig.url} onChange={e => setNewConfig({...newConfig, url: e.target.value})}
               placeholder="https://vnexpress.net/kinh-doanh"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 ml-1">Lịch Cron (Phút Giờ Ngày Tháng Thứ)</label>
            <input 
               className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-mono"
               value={newConfig.cron_config} onChange={e => setNewConfig({...newConfig, cron_config: e.target.value})}
               placeholder="0 15 * * *"
            />
            <p className="text-[10px] text-slate-400 ml-1">* Mẹo: "0 15 * * *" là 3 giờ chiều mỗi ngày</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-600 ml-1">Giới hạn bài/lần</label>
            <input 
               type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm"
               value={newConfig.article_limit} onChange={e => setNewConfig({...newConfig, article_limit: parseInt(e.target.value)})}
            />
          </div>

          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2">
            <Save size={18}/> Kích Hoạt Lịch Trình
          </button>
        </form>

        <div className="mt-10 overflow-hidden border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Nguồn & Chủ Đề</th>
                <th className="px-6 py-4">URL Mục Tiêu</th>
                <th className="px-6 py-4">Lịch Chạy</th>
                <th className="px-6 py-4">Số Bài</th>
                <th className="px-6 py-4">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
                {configs.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition font-medium">
                    <td className="px-6 py-4">
                      {c.source.name} <span className="text-indigo-400 mx-1">→</span> {c.topic.name}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{c.url}</td>
                    <td className="px-6 py-4 font-mono text-xs bg-slate-100 rounded-lg scale-90">{c.cron_config}</td>
                    <td className="px-6 py-4 text-center">{c.article_limit}</td>
                    <td className="px-6 py-4">
                       <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border border-green-200">Hoạt động</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
