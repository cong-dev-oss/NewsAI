"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  History, Clock, 
  ExternalLink,
  Play, CheckCircle2,
  AlertCircle, Loader2
} from "lucide-react";

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [activeTasks, setActiveTasks] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getHistory();
        setHistory(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/progress";
    const socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setActiveTasks(prev => ({
        ...prev,
        [data.id]: data
      }));

      if (data.status === 'COMPLETED') {
        setTimeout(() => {
          api.getHistory().then(setHistory);
        }, 3000);
      }
    };

    return () => socket.close();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-zinc-100 text-zinc-900 border-zinc-200";
      case "FAILED": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-zinc-900 text-white border-zinc-900 animate-pulse";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Real-time system monitoring and processing history.</p>
        </div>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition flex items-center gap-2">
            <Play size={14} fill="currentColor" />
            Trigger Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">Active Tasks</span>
                <Clock size={16} className="text-zinc-400" />
            </div>
            <p className="text-2xl font-bold">{Object.keys(activeTasks).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">Total Processed</span>
                <CheckCircle2 size={16} className="text-zinc-400" />
            </div>
            <p className="text-2xl font-bold">{history.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">Success Rate</span>
                <History size={16} className="text-zinc-400" />
            </div>
            <p className="text-2xl font-bold">98.2%</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            Running Jobs
        </h2>
        {Object.keys(activeTasks).length === 0 ? (
            <div className="p-12 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200 text-zinc-400 text-sm">
                No active processing tasks at the moment.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(activeTasks).map((task: any) => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Task #{task.id}</span>
                            <span className="text-xs font-medium text-zinc-900">{Math.round(task.progress * 100)}%</span>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-1">{task.title || "Initializing..."}</h3>
                        <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                            <div className="bg-zinc-900 h-full transition-all duration-500" style={{ width: `${task.progress * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      <section className="space-y-4 pb-10">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Article</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3">Processed At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {loading ? (
                            <tr><td colSpan={3} className="px-6 py-10 text-center text-zinc-400">Loading history...</td></tr>
                        ) : history.slice(0, 10).map((item: any) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-zinc-900 line-clamp-1">{item.title}</p>
                                    <a href={item.url} target="_blank" className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1 mt-1">
                                        Source <ExternalLink size={10} />
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${getStatusBadge(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 tabular-nums">
                                    {new Date(item.processed_at).toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </section>
    </div>
  );
}
