"use client";

import { useEffect, useState } from "react";

import { pipelineApi } from "@/lib/pipelineApi";
import { createRunNowFeedback } from "@/lib/pipelineRunFeedback";

type RunFeedback = {
  kind: "success" | "warning" | "info";
  message: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PipelinePage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [creating, setCreating] = useState(false);
  const [runningAll, setRunningAll] = useState(false);
  const [rowAction, setRowAction] = useState<{ id: number; type: "run" | "delete" } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [runFeedback, setRunFeedback] = useState<RunFeedback | null>(null);
  const [form, setForm] = useState({
    topic_id: "",
    source_type: "newsdata",
    fetch_limit: 20,
    pick_limit: 8,
    schedule_cron: "0 2 * * *",
  });
  const sourceTypes = [...new Set(["newsdata", "gnews", "trading_economics", ...sources.map((source) => source?.source_type || "custom")])];
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]));

  const getLatestRunId = async (): Promise<number | null> => {
    try {
      const response = await fetch("/api/v1/research/runs?limit=1", { cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!Array.isArray(data) || data.length === 0) return null;
      const value = Number(data[0]?.id);
      return Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  };

  const waitForRunKickoff = async (baselineRunId: number | null): Promise<boolean> => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const latestRunId = await getLatestRunId();
      if (latestRunId !== null && (baselineRunId === null || latestRunId > baselineRunId)) {
        return true;
      }
      if (attempt < 3) {
        await sleep(1500);
      }
    }
    return false;
  };

  const load = async (showLoading = true) => {
    if (showLoading) setLoadingPage(true);
    try {
      const [configRows, topicRows, sourceRows] = await Promise.all([
        pipelineApi.listConfigs(),
        pipelineApi.listTopics(),
        pipelineApi.listSources(),
      ]);
      const safeConfigs = Array.isArray(configRows) ? configRows : [];
      const safeTopics = Array.isArray(topicRows) ? topicRows : [];
      const safeSources = Array.isArray(sourceRows) ? sourceRows : [];

      setConfigs(safeConfigs);
      setTopics(safeTopics);
      setSources(safeSources);
      setErrorMessage("");
    } catch (error: any) {
      const message = error?.message || "Load pipeline data failed";
      setErrorMessage(message);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic_id) {
      return;
    }
    setCreating(true);
    setErrorMessage("");
    setRunFeedback(null);
    try {
      await pipelineApi.createConfig({
        topic_id: Number(form.topic_id),
        source_type: form.source_type,
        fetch_limit: Number(form.fetch_limit),
        pick_limit: Number(form.pick_limit),
        schedule_cron: form.schedule_cron,
        is_active: true,
        story_roundup_enabled: true,
        story_deep_dive_enabled: true,
        roundup_count: 1,
        deep_dive_count: 1,
        priority_weight: 100,
      });
      await load(false);
    } catch (error: any) {
      setErrorMessage(error?.message || "Create pipeline config failed");
    } finally {
      setCreating(false);
    }
  };

  const runAllNow = async () => {
    setRunningAll(true);
    setErrorMessage("");
    setRunFeedback(null);
    try {
      const baselineRunId = await getLatestRunId();
      const result = await pipelineApi.runNow("all");
      const triggeredCount = Number(result?.triggered_count ?? 0);
      const kickoffDetected = triggeredCount > 0 ? await waitForRunKickoff(baselineRunId) : false;
      setRunFeedback(
        createRunNowFeedback({
          triggeredCount,
          kickoffDetected,
          targetLabel: "pipeline(s)",
        }) as RunFeedback,
      );
      await load(false);
    } catch (error: any) {
      setErrorMessage(error?.message || "Run now failed");
    } finally {
      setRunningAll(false);
    }
  };

  const runConfigNow = async (configId: number) => {
    setRowAction({ id: configId, type: "run" });
    setErrorMessage("");
    setRunFeedback(null);
    try {
      const baselineRunId = await getLatestRunId();
      const result = await pipelineApi.runNow("config", undefined, configId);
      const triggeredCount = Number(result?.triggered_count ?? 0);
      const kickoffDetected = triggeredCount > 0 ? await waitForRunKickoff(baselineRunId) : false;
      setRunFeedback(
        createRunNowFeedback({
          triggeredCount,
          kickoffDetected,
          targetLabel: `pipeline config #${configId}`,
        }) as RunFeedback,
      );
      await load(false);
    } catch (error: any) {
      setErrorMessage(error?.message || "Run config failed");
    } finally {
      setRowAction(null);
    }
  };

  const deleteConfig = async (configId: number) => {
    setRowAction({ id: configId, type: "delete" });
    setErrorMessage("");
    setRunFeedback(null);
    try {
      await pipelineApi.deleteConfig(configId);
      await load(false);
    } catch (error: any) {
      setErrorMessage(error?.message || "Delete pipeline config failed");
    } finally {
      setRowAction(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Pipeline</h1>
          <p className="text-zinc-500 mt-1">Configure source + topic ingestion and run workflows manually.</p>
        </div>
        <button
          className="px-4 py-2 bg-zinc-900 text-white rounded-md"
          type="button"
          disabled={runningAll || creating || !!rowAction}
          onClick={runAllNow}
        >
          {runningAll ? "Running..." : "Run now"}
        </button>
      </div>
      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}
      {runFeedback && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            runFeedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : runFeedback.kind === "warning"
                ? "border-orange-200 bg-orange-50 text-orange-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {runFeedback.message}
          {runFeedback.kind === "warning" && (
            <p className="text-xs mt-1">
              Tip: start worker with <code>celery -A app.core.celery_app.celery_app worker -l info</code>
            </p>
          )}
        </div>
      )}

      <form onSubmit={createConfig} className="bg-white border rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-zinc-700 font-medium">Topic (Chu de)</span>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.topic_id}
              disabled={creating || loadingPage}
              onChange={(e) => setForm((prev) => ({ ...prev, topic_id: e.target.value }))}
            >
              <option value="">Select topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-zinc-700 font-medium">Source Type (Nguon)</span>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.source_type}
              disabled={creating || loadingPage}
              onChange={(e) => setForm((prev) => ({ ...prev, source_type: e.target.value }))}
            >
              {sourceTypes.map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {sourceType}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-zinc-700 font-medium">Fetch Limit</span>
            <input
              className="w-full border rounded-md px-3 py-2"
              type="number"
              min={1}
              value={form.fetch_limit}
              disabled={creating || loadingPage}
              onChange={(e) => setForm((prev) => ({ ...prev, fetch_limit: Number(e.target.value) }))}
              placeholder="So tin lay ve"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-zinc-700 font-medium">Pick Limit</span>
            <input
              className="w-full border rounded-md px-3 py-2"
              type="number"
              min={1}
              value={form.pick_limit}
              disabled={creating || loadingPage}
              onChange={(e) => setForm((prev) => ({ ...prev, pick_limit: Number(e.target.value) }))}
              placeholder="So tin giu lai"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-zinc-700 font-medium">Cron Schedule</span>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.schedule_cron}
              disabled={creating || loadingPage}
              onChange={(e) => setForm((prev) => ({ ...prev, schedule_cron: e.target.value }))}
              placeholder="0 2 * * *"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Topic = chu de, Source = nguon lay tin, Fetch = lay bao nhieu tin, Pick = giu bao nhieu tin de tao story.
          </p>
          <button
            className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-60"
            disabled={creating || loadingPage}
          >
            {creating ? "Adding..." : "Add pipeline"}
          </button>
        </div>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Topic</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Cron</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingPage ? (
              <tr>
                <td className="px-4 py-5 text-zinc-500" colSpan={5}>
                  Loading pipeline data...
                </td>
              </tr>
            ) : (
              configs.map((config) => (
              <tr key={config.id} className="border-t">
                <td className="px-4 py-3">{config.id}</td>
                <td className="px-4 py-3">{topicNameById.get(config.topic_id) || `#${config.topic_id}`}</td>
                <td className="px-4 py-3">{config.source_type}</td>
                <td className="px-4 py-3">{config.schedule_cron}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    className="px-2 py-1 border rounded"
                    type="button"
                    disabled={!!rowAction || runningAll || creating}
                    onClick={() => runConfigNow(config.id)}
                  >
                    {rowAction?.id === config.id && rowAction?.type === "run" ? "Running..." : "Run now"}
                  </button>
                  <button
                    className="px-2 py-1 border rounded text-red-600"
                    type="button"
                    disabled={!!rowAction || runningAll || creating}
                    onClick={() => deleteConfig(config.id)}
                  >
                    {rowAction?.id === config.id && rowAction?.type === "delete" ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
            )}
            {!loadingPage && configs.length === 0 && (
              <tr>
                <td className="px-4 py-5 text-zinc-500" colSpan={5}>
                  No pipeline configs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
