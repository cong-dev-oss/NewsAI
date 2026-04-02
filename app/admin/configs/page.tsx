"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  Plus, Settings, 
  Trash2, Save, 
  Globe, Tags, 
  CalendarClock,
  MoreVertical, ChevronRight,
  Database,
  ArrowRightLeft,
  Activity,
  PlusCircle
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

  const [showConfigForm, setShowConfigForm] = useState(false);

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
      } catch (e) {
        console.error(e);
      }
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
    setShowConfigForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Configuration</h1>
          <p className="text-zinc-500 mt-1">Manage sources, taxonomies, and automated news pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN: MASTER DATA FORMS */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <h2 className="text-sm font-semibold flex items-center gap-2 tracking-tight uppercase text-zinc-400">
                <Database size={14} /> Master Registry
            </h2>
            
            {/* SOURCE FORM */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4">
               <h3 className="text-xs font-bold flex items-center gap-2"><Globe size={14} className="text-zinc-400"/> New Source</h3>
               <form onSubmit={handleCreateSource} className="space-y-3">
                  <input 
                    placeholder="Source Name (e.g. CNN)" 
                    className="w-full bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-xl text-sm outline-none focus:border-zinc-900 transition-all"
                    value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})}
                  />
                  <input 
                    placeholder="Root Domain (https://...)" 
                    className="w-full bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-xl text-sm outline-none focus:border-zinc-900 transition-all"
                    value={newSource.base_url} onChange={e => setNewSource({...newSource, base_url: e.target.value})}
                  />
                  <button type="submit" className="w-full bg-zinc-900 text-white p-2.5 rounded-xl hover:bg-zinc-800 font-medium transition text-xs">
                    Add Source
                  </button>
               </form>
            </div>

            {/* TOPIC FORM */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm space-y-4">
               <h3 className="text-xs font-bold flex items-center gap-2"><Tags size={14} className="text-zinc-400"/> New Category</h3>
               <form onSubmit={handleCreateTopic} className="space-y-3">
                  <input 
                    placeholder="Finance, Tech, Sports..." 
                    className="w-full bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-xl text-sm outline-none focus:border-zinc-900 transition-all"
                    value={newTopic.name} onChange={e => setNewTopic({...newTopic, name: e.target.value})}
                  />
                  <button type="submit" className="w-full bg-zinc-900 text-white p-2.5 rounded-xl hover:bg-zinc-800 font-medium transition text-xs">
                    Register Category
                  </button>
               </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE DATA SUMMARIES & PIPELINES */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* DATA SUMMARY CHIPS */}
          <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-200/60 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Available Sources</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sources.map(s => (
                    <span key={s.id} className="bg-white px-2.5 py-1 rounded-lg text-[11px] font-medium border border-zinc-200 text-zinc-600 shadow-sm">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Segments</h4>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map(t => (
                    <span key={t.id} className="bg-zinc-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PIPELINES SECTION */}
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold flex items-center gap-2 tracking-tight uppercase text-zinc-400">
                    <ArrowRightLeft size={14} /> Automation Pipelines
                </h2>
                <button 
                    onClick={() => setShowConfigForm(!showConfigForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition shadow-sm"
                >
                    {showConfigForm ? "Cancel" : <><Plus size={14} /> New Pipeline</>}
                </button>
             </div>

             {showConfigForm && (
                <form onSubmit={handleCreateConfig} className="bg-zinc-900 text-white p-8 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Source Agency</label>
                            <select 
                                className="w-full bg-zinc-800 border-none p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-700 transition"
                                value={newConfig.source_id} onChange={e => setNewConfig({...newConfig, source_id: e.target.value})}
                            >
                                <option value="">-- Choose --</option>
                                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Topic Category</label>
                            <select 
                                className="w-full bg-zinc-800 border-none p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-700 transition"
                                value={newConfig.topic_id} onChange={e => setNewConfig({...newConfig, topic_id: e.target.value})}
                            >
                                <option value="">-- Choose --</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Batch Article Limit</label>
                            <input 
                                type="number"
                                className="w-full bg-zinc-800 border-none p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-700 transition"
                                value={newConfig.article_limit} onChange={e => setNewConfig({...newConfig, article_limit: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Target URL</label>
                            <input 
                                placeholder="https://..."
                                className="w-full bg-zinc-800 border-none p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-700 transition"
                                value={newConfig.url} onChange={e => setNewConfig({...newConfig, url: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cron Schedule</label>
                            <input 
                                placeholder="0 15 * * *"
                                className="w-full bg-zinc-800 border-none p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-700 transition"
                                value={newConfig.cron_config} onChange={e => setNewConfig({...newConfig, cron_config: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-white text-zinc-900 p-3 rounded-xl hover:bg-zinc-100 font-bold transition text-sm shadow-xl shadow-white/5">
                        Create Pipeline Instance
                    </button>
                </form>
             )}

             <div className="bg-white rounded-2xl border border-zinc-200/60 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 font-medium">
                        <tr>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black">Mapping</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black">Target URL</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black">Schedule</th>
                            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-center">Batch</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {configs.map(c => (
                            <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-900">{c.source.name}</span>
                                        <ChevronRight size={10} className="text-zinc-300" />
                                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-600 border border-zinc-200">{c.topic.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-[200px] truncate text-zinc-400 text-xs font-medium tabular-nums">{c.url}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarClock size={14} className="text-zinc-400" />
                                        <span className="font-bold text-sm tracking-tight">{c.cron_config}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-zinc-400">
                                    {c.article_limit}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><Settings size={16} /></button>
                                        <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
