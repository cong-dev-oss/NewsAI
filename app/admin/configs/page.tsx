"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import AlertDialog from "@/components/ui/alert-dialog";
import { 
  Plus, Settings, 
  Trash2, 
  Globe, Tags, 
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Database,
  ArrowRightLeft,
  PlusCircle
} from "lucide-react";

export default function ConfigsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [dialogConfirmLabel, setDialogConfirmLabel] = useState("Tiếp tục");
  const [dialogShowCancel, setDialogShowCancel] = useState(true);
  const [dialogVariant, setDialogVariant] = useState<"default" | "destructive">("default");
  const [dialogAction, setDialogAction] = useState<null | (() => Promise<void> | void)>(null);

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

  const resetConfigForm = () => {
    setNewConfig({ source_id: "", topic_id: "", url: "", cron_config: "0 15 * * *", article_limit: 5 });
    setEditingConfigId(null);
    setShowConfigForm(false);
  };

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
    const payload = {
      ...newConfig,
      source_id: parseInt(newConfig.source_id),
      topic_id: parseInt(newConfig.topic_id),
      article_limit: parseInt(newConfig.article_limit.toString())
    };

    if (editingConfigId) {
      await api.updateConfig(editingConfigId, payload);
    } else {
      await api.createConfig(payload);
    }

    setConfigs(await api.getConfigs());
    resetConfigForm();
  };

  const handleEditConfig = (config: any) => {
    setEditingConfigId(config.id);
    setNewConfig({
      source_id: config.source_id.toString(),
      topic_id: config.topic_id.toString(),
      url: config.url,
      cron_config: config.cron_config,
      article_limit: config.article_limit
    });
    setShowConfigForm(true);
  };

  const openConfirmDialog = ({
    title,
    description,
    confirmLabel,
    variant = "default",
    showCancel = true,
    action,
  }: {
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "default" | "destructive";
    showCancel?: boolean;
    action: () => Promise<void> | void;
  }) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogConfirmLabel(confirmLabel);
    setDialogVariant(variant);
    setDialogShowCancel(showCancel);
    setDialogAction(() => action);
    setDialogOpen(true);
  };

  const handleDeleteTopic = (topic: any) => {
    openConfirmDialog({
      title: `Xóa segment "${topic.name}"?`,
      description: "Segment sẽ bị xóa khỏi registry. Nếu đang được dùng bởi pipeline, hệ thống sẽ chặn thao tác để tránh làm hỏng cấu hình.",
      confirmLabel: "Xóa segment",
      variant: "destructive",
      action: async () => {
        setDialogLoading(true);
        try {
          await api.deleteTopic(topic.id);
          setTopics(await api.getTopics());
          setDialogOpen(false);
        } catch (e: any) {
          setDialogTitle("Không thể xóa segment");
          setDialogDescription(e.message || "Segment này đang được sử dụng hoặc đã phát sinh lỗi.");
          setDialogConfirmLabel("Đã hiểu");
          setDialogVariant("default");
          setDialogShowCancel(false);
          setDialogAction(() => () => setDialogOpen(false));
        } finally {
          setDialogLoading(false);
        }
      },
    });
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
                    <div key={t.id} className="group inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      <span>{t.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(t)}
                        className="rounded-sm p-0.5 text-zinc-400 opacity-0 transition hover:bg-zinc-800 hover:text-white group-hover:opacity-100"
                        title="Xóa nhanh segment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
                    onClick={() => {
                      if (showConfigForm && !editingConfigId) {
                        setShowConfigForm(false);
                      } else if (editingConfigId) {
                        resetConfigForm();
                      } else {
                        setShowConfigForm(true);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition shadow-sm"
                >
                    {showConfigForm ? "Cancel" : <><Plus size={14} /> New Pipeline</>}
                </button>
             </div>

             {showConfigForm && (
                <form onSubmit={handleCreateConfig} className="bg-zinc-900 text-white p-8 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {editingConfigId ? `Edit Pipeline #${editingConfigId}` : "Create Pipeline"}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {editingConfigId ? "Cập nhật nguồn, chủ đề, lịch chạy và giới hạn bài viết." : "Tạo pipeline crawl mới cho hệ thống."}
                            </p>
                        </div>
                        {editingConfigId && (
                            <button
                                type="button"
                                onClick={resetConfigForm}
                                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                            >
                                Hủy sửa
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Source Agency</label>
                            <div className="relative">
                                <select 
                                    className="h-11 w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-800 px-3 pr-10 text-sm font-medium text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40"
                                    value={newConfig.source_id}
                                    onChange={e => setNewConfig({...newConfig, source_id: e.target.value})}
                                >
                                    <option value="" className="text-zinc-400">-- Choose --</option>
                                    {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Topic Category</label>
                            <div className="relative">
                                <select 
                                    className="h-11 w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-800 px-3 pr-10 text-sm font-medium text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/40"
                                    value={newConfig.topic_id}
                                    onChange={e => setNewConfig({...newConfig, topic_id: e.target.value})}
                                >
                                    <option value="" className="text-zinc-400">-- Choose --</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
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
                        {editingConfigId ? "Save Pipeline Changes" : "Create Pipeline Instance"}
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
                                        <button
                                            onClick={() => handleEditConfig(c)}
                                            className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                                            title="Sửa pipeline"
                                        >
                                            <Settings size={16} />
                                        </button>
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
      <AlertDialog
        open={dialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={dialogConfirmLabel}
        variant={dialogVariant}
        loading={dialogLoading}
        showCancel={dialogShowCancel}
        onOpenChange={setDialogOpen}
        onConfirm={async () => {
          if (!dialogAction) {
            setDialogOpen(false);
            return;
          }
          await dialogAction();
        }}
      />
    </div>
  );
}
