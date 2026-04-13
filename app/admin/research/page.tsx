"use client";

import { useEffect, useState } from "react";
import { getResearchRunMetrics } from "@/lib/researchRunMetrics";

const ACTIVE_STATUSES = new Set(["running", "queued", "pending", "in_progress"]);

const normalizeStatus = (status: unknown) => String(status || "").trim().toLowerCase();

const getStatusBadgeClass = (status: unknown) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed" || normalized === "success" || normalized === "succeeded") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (normalized === "failed" || normalized === "error") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (ACTIVE_STATUSES.has(normalized)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
};

export default function ResearchPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");

  const loadRuns = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/v1/research/runs", { cache: "no-store" });
      const data = await res.json();
      setRuns(Array.isArray(data) ? data : []);
      setErrorMessage("");
      setLastUpdatedAt(new Date().toLocaleTimeString("vi-VN"));
    } catch (error: any) {
      if (!silent) {
        setErrorMessage(error?.message || "Load research runs failed");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    const hasActiveRuns = runs.some((run) => ACTIVE_STATUSES.has(normalizeStatus(run?.status)));
    if (!hasActiveRuns) return;

    const timer = setInterval(() => {
      loadRuns(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [runs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRuns();
    setRefreshing(false);
  };

  const metrics = getResearchRunMetrics(runs);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Research</h1>
          <p className="text-zinc-500 mt-1">Inspect pipeline run history and signal selection results.</p>
          <p className="text-xs text-zinc-400 mt-1">
            {lastUpdatedAt ? `Cap nhat luc ${lastUpdatedAt}` : "Dang tai du lieu..."} - Tu dong refresh khi co run dang chay.
          </p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-60" onClick={handleRefresh} disabled={loading || refreshing}>
          {loading || refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total runs</p>
          <p className="text-2xl font-semibold text-zinc-900">{metrics.total}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Running / Queue</p>
          <p className="text-2xl font-semibold text-amber-600">{metrics.active}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Completed</p>
          <p className="text-2xl font-semibold text-emerald-600">{metrics.completed}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Failed</p>
          <p className="text-2xl font-semibold text-rose-600">{metrics.failed}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Success rate</p>
          <p className="text-2xl font-semibold text-zinc-900">{metrics.successRate}%</p>
          <p className="text-xs text-zinc-500 mt-1">Fail rate: {metrics.failureRate}%</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">Run</th>
              <th className="px-4 py-3 text-left">Topic</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Signals</th>
              <th className="px-4 py-3 text-left">Summary / Error</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id} className="border-t">
                  <td className="px-4 py-3">#{run.id}</td>
                  <td className="px-4 py-3">{run.topic_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${getStatusBadgeClass(run.status)}`}>
                      {run.status || "unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {run.selected_count}/{run.raw_count}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-700">{run.summary || "-"}</p>
                    {run.error_message ? <p className="text-xs text-rose-600 mt-1 line-clamp-2">{run.error_message}</p> : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
