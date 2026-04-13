"use client";

import { useEffect, useState } from "react";

import { storyApi } from "@/lib/storyApi";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionState, setActionState] = useState<{ id: number; type: "review" | "publish" | "delete" } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStories = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const rows = await storyApi.list({ limit: 100 });
      setStories(Array.isArray(rows) ? rows : []);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error?.message || "Load stories failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStories(true);
    setRefreshing(false);
  };

  const handleStoryAction = async (storyId: number, type: "review" | "publish" | "delete") => {
    setActionState({ id: storyId, type });
    try {
      if (type === "review") await storyApi.review(storyId);
      if (type === "publish") await storyApi.publish(storyId);
      if (type === "delete") await storyApi.remove(storyId);
      await loadStories(false);
    } catch (error: any) {
      setErrorMessage(error?.message || "Story action failed");
    } finally {
      setActionState(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Stories</h1>
          <p className="text-zinc-500 mt-1">Review, publish, and manage generated newsroom stories.</p>
        </div>
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-60" onClick={handleRefresh} disabled={refreshing || !!actionState}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : (
              stories.map((story) => (
                <tr key={story.id} className="border-t">
                  <td className="px-4 py-3">{story.title}</td>
                  <td className="px-4 py-3">{story.story_type}</td>
                  <td className="px-4 py-3">{story.status}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-60"
                      disabled={!!actionState}
                      onClick={() => handleStoryAction(story.id, "review")}
                    >
                      {actionState?.id === story.id && actionState?.type === "review" ? "Reviewing..." : "Review"}
                    </button>
                    <button
                      className="px-2 py-1 border rounded disabled:opacity-60"
                      disabled={!!actionState}
                      onClick={() => handleStoryAction(story.id, "publish")}
                    >
                      {actionState?.id === story.id && actionState?.type === "publish" ? "Publishing..." : "Publish"}
                    </button>
                    <button
                      className="px-2 py-1 border rounded text-red-600 disabled:opacity-60"
                      disabled={!!actionState}
                      onClick={() => handleStoryAction(story.id, "delete")}
                    >
                      {actionState?.id === story.id && actionState?.type === "delete" ? "Deleting..." : "Delete"}
                    </button>
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
