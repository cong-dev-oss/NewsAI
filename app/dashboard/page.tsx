"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { 
  History, Clock, 
  RotateCcw, ExternalLink, 
  CheckCircle, Loader2, 
  AlertCircle,
  Play
} from "lucide-react";

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [activeTasks, setActiveTasks] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch historical record from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getHistory();
        setHistory(data);
        setLoading(false);
      } catch (e) {
        console.error("Fetch history failed", e);
      }
    };
    fetchData();
  }, []);

  // 2. WebSocket listener for real-time progress
  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/progress";
    const socket = new WebSocket(WS_URL);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Data:", data);
      
      // Cập nhật trạng thái bài liên tục
      setActiveTasks(prev => ({
        ...prev,
        [data.id]: {
          ...prev[data.id],
          ...data
        }
      }));

      // Nếu đã hoàn tất, có thể trigger refresh history sau 5s
      if (data.status === 'COMPLETED') {
        setTimeout(() => {
          api.getHistory().then(setHistory);
        }, 5000);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500/10 text-green-600 border-green-200";
      case "CRAWLING": return "bg-blue-500/10 text-blue-600 border-blue-200 animate-pulse";
      case "SUMMARIZING": return "bg-purple-500/10 text-purple-600 border-purple-200 animate-pulse";
      case "SAVING": return "bg-yellow-500/10 text-yellow-600 border-yellow-200 animate-pulse";
      case "FAILED": return "bg-red-500/10 text-red-600 border-red-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500">Giám sát quy trình cào tin tự động theo thời gian thực</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition">
            <Play size={18} />
            Chạy thủ công
          </button>
        </div>
      </header>

      {/* 1. Real-time Monitoring Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-700">
          <Clock size={20} className="text-indigo-600" />
          Đang thực thi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(activeTasks).length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
              Chưa có tác vụ nào đang chạy...
            </div>
          ) : (
            Object.values(activeTasks).map((task: any) => (
              <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{Math.round(task.progress * 100)}%</span>
                </div>
                <h3 className="font-semibold text-slate-700 line-clamp-1">{task.title || "Đang lấy tiêu đề..."}</h3>
                
                {/* Progress Bar shadcn style */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${task.progress * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. Article History Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-700">
          <History size={20} className="text-indigo-600" />
          Lịch sử bài viết
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Chủ đề</th>
                <th className="px-6 py-4">Kết quả tóm tắt</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">Chưa có lịch sử.</td>
                </tr>
              ) : history.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-medium text-slate-800 line-clamp-2 mb-1">{item.title}</p>
                    <a href={item.url} target="_blank" className="text-indigo-500 flex items-center gap-1 text-xs hover:underline">
                      Xem bài gốc <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium text-slate-600 border border-slate-200">
                      Cấu hình #{item.config_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-slate-500 line-clamp-3 text-xs leading-relaxed italic">{item.summary}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {new Date(item.processed_at).toLocaleString('vi-VN')}
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
