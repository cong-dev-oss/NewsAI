"use client";

import React, { useEffect, useState } from "react";

import { pipelineApi } from "@/lib/pipelineApi";
import { storyApi } from "@/lib/storyApi";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [storyRows, runRows, configRows] = await Promise.all([
        storyApi.list({ limit: 50 }),
        fetch("/api/v1/research/runs").then((res) => res.json()),
        pipelineApi.listConfigs(),
      ]);
      setStories(Array.isArray(storyRows) ? storyRows : []);
      setRuns(Array.isArray(runRows) ? runRows : []);
      setConfigs(Array.isArray(configRows) ? configRows : []);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error?.message || "Load dashboard failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publishedCount = stories.filter((item) => item.status === "published").length;
  const draftCount = stories.filter((item) => item.status === "draft").length;
  const runSuccessCount = runs.filter((item) => item.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Newsroom pipeline and story operations overview.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-white">
          <p className="text-sm text-zinc-500">Stories</p>
          <p className="text-2xl font-semibold">{stories.length}</p>
        </div>
        <div className="p-5 rounded-xl border bg-white">
          <p className="text-sm text-zinc-500">Published</p>
          <p className="text-2xl font-semibold">{publishedCount}</p>
        </div>
        <div className="p-5 rounded-xl border bg-white">
          <p className="text-sm text-zinc-500">Drafts</p>
          <p className="text-2xl font-semibold">{draftCount}</p>
        </div>
        <div className="p-5 rounded-xl border bg-white">
          <p className="text-sm text-zinc-500">Active Pipelines</p>
          <p className="text-2xl font-semibold">{configs.filter((item) => item.is_active).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border rounded-xl">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Recent Research Runs</h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : (
              runs.slice(0, 6).map((run) => (
                <div key={run.id} className="flex items-center justify-between text-sm">
                  <span>Run #{run.id}</span>
                  <span className="text-zinc-500">{run.status}</span>
                </div>
              ))
            )}
            {!loading && runs.length === 0 && <p className="text-sm text-zinc-500">No runs yet.</p>}
          </div>
        </section>

        <section className="bg-white border rounded-xl">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Story Throughput</h2>
          </div>
          <div className="p-4 text-sm text-zinc-600 space-y-2">
            <p>Completed runs: {runSuccessCount}</p>
            <p>Roundup stories: {stories.filter((item) => item.story_type === "roundup").length}</p>
            <p>Deep dive stories: {stories.filter((item) => item.story_type === "deep_dive").length}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
