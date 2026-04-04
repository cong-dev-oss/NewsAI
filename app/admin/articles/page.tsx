"use client"
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import AlertDialog from "@/components/ui/alert-dialog";
import { 
  Search, 
  Eye, Trash2, RefreshCw,
  FileText,
  Clock,
  ArrowUpRight,
  CheckSquare,
  Square,
  Filter,
  Newspaper
} from "lucide-react";

type StatusFilter = "all" | "published" | "draft";

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

export default function ArticlesManagementPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [dialogConfirmLabel, setDialogConfirmLabel] = useState("Tiếp tục");
  const [dialogAction, setDialogAction] = useState<null | (() => Promise<void> | void)>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getAllArticles(500);
      setArticles(data);
      setSelectedIds([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && article.is_processed) ||
      (statusFilter === "draft" && !article.is_processed);

    return matchesSearch && matchesStatus;
  });

  const selectedSet = new Set(selectedIds);
  const filteredIds = filteredArticles.map((article) => article.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedSet.has(id));

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }

      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const openConfirmDialog = ({
    title,
    description,
    confirmLabel,
    action,
  }: {
    title: string;
    description: string;
    confirmLabel: string;
    action: () => Promise<void> | void;
  }) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogConfirmLabel(confirmLabel);
    setDialogAction(() => action);
    setDialogOpen(true);
  };

  const handleDeleteOne = async (id: number) => {
    openConfirmDialog({
      title: "Xóa bài viết này?",
      description: "Bài viết sẽ bị xóa khỏi danh sách quản trị. Thao tác này không thể hoàn tác.",
      confirmLabel: "Xóa bài viết",
      action: async () => {
        setDialogLoading(true);
        setDeletingIds((prev) => [...prev, id]);
        try {
          await api.deleteArticle(id);
          setArticles((prev) => prev.filter((article) => article.id !== id));
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          setDialogOpen(false);
        } catch (e) {
          console.error(e);
        } finally {
          setDialogLoading(false);
          setDeletingIds((prev) => prev.filter((item) => item !== id));
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    openConfirmDialog({
      title: `Xóa ${selectedIds.length} bài viết đã chọn?`,
      description: "Các bài viết được chọn sẽ bị xóa hàng loạt. Hãy kiểm tra kỹ trước khi xác nhận.",
      confirmLabel: `Xóa ${selectedIds.length} bài`,
      action: async () => {
        setDialogLoading(true);
        setBulkDeleting(true);
        try {
          await api.bulkDeleteArticles(selectedIds);
          setArticles((prev) => prev.filter((article) => !selectedSet.has(article.id)));
          setSelectedIds([]);
          setDialogOpen(false);
        } catch (e) {
          console.error(e);
        } finally {
          setDialogLoading(false);
          setBulkDeleting(false);
        }
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Newspaper size={16} />
            <span className="text-sm font-medium">Content Management</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Articles Explorer</h1>
          <p className="mt-1 text-sm text-zinc-500">Quản lý bài viết đã crawl, lọc theo trạng thái và thao tác hàng loạt.</p>
        </div>
        
        <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} className="mr-2" />
              {bulkDeleting ? `Đang xóa ${selectedIds.length}` : `Xóa ${selectedIds.length} bài`}
            </button>
          )}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by title or summary content..."
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
             onClick={fetchArticles}
             className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950"
             title="Làm mới danh sách"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500">
              <Filter size={12} />
              Filter trạng thái
            </div>
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Tổng bài viết</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{articles.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Đang hiển thị</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{filteredArticles.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Đã chọn</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{selectedIds.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-32 text-center text-sm font-medium text-zinc-400">
                Syncing with master database...
             </div>
        ) : filteredArticles.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-32 text-center text-zinc-400">
                <FileText size={48} className="mx-auto opacity-10 mb-4" />
                <p className="font-bold text-zinc-900">No articles found</p>
                <p className="text-xs max-w-xs mx-auto">Try a different search query or check if your automation pipelines are currently active.</p>
            </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-3 text-xs font-medium text-zinc-500">
              Bảng bài viết theo phong cách quản trị tối giản, hover nhẹ và thao tác trực tiếp.
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-50 text-[11px] font-medium text-zinc-500">
                    <tr>
                        <th className="px-6 py-4 w-12">
                            <button
                              onClick={toggleSelectAllFiltered}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-950"
                              title={allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                            >
                              {allFilteredSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                        </th>
                        <th className="px-6 py-4">Title & Source</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">State</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {filteredArticles.map((article) => (
                        <tr key={article.id} className="group transition-colors hover:bg-zinc-50/70">
                            <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedSet.has(article.id)}
                                  onChange={() => toggleSelected(article.id)}
                                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                />
                            </td>
                            <td className="px-6 py-4 max-w-md">
                                <div className="space-y-1.5">
                                    <h3 className="line-clamp-1 font-medium leading-tight text-zinc-950 transition-colors group-hover:text-zinc-700">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <a href={article.url} target="_blank" className="flex items-center gap-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-700">
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
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                                    {article.category || "General"}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                                    article.is_processed ? 'border-zinc-200 bg-zinc-100 text-zinc-900' : 'border-amber-200 bg-amber-50 text-amber-700'
                                }`}>
                                    {article.is_processed ? 'PUBLISHED' : 'DRAFT'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                    <a
                                      href={`/article/${article.id}`}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                                      title="Xem bài viết"
                                    >
                                        <Eye size={16} />
                                    </a>
                                    <button
                                      onClick={() => handleDeleteOne(article.id)}
                                      disabled={deletingIds.includes(article.id)}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                      title="Xóa bài viết"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        open={dialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={dialogConfirmLabel}
        variant="destructive"
        loading={dialogLoading}
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
