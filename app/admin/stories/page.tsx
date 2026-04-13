"use client";

import { useEffect, useMemo, useState } from "react";

import { storyApi } from "@/lib/storyApi";
import { extractApiErrorMessage } from "@/lib/errorMessage";

const PAGE_SIZE = 10;

type StoryActionType = "review" | "publish" | "delete" | "bulk_delete";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionState, setActionState] = useState<{ id?: number; type: StoryActionType } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const toUiErrorMessage = (error: unknown, fallback: string) => extractApiErrorMessage(error, fallback);

  const loadStories = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [rows, topicRows] = await Promise.all([storyApi.list({ limit: 200 }), storyApi.listTopics()]);
      setStories(Array.isArray(rows) ? rows : []);
      setTopics(Array.isArray(topicRows) ? topicRows : []);
      setSelectedStoryIds((prev) => prev.filter((id) => (Array.isArray(rows) ? rows.some((item: any) => item.id === id) : false)));
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(toUiErrorMessage(error, "Load stories failed"));
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
      if (type === "delete") {
        setSelectedStoryIds((prev) => prev.filter((id) => id !== storyId));
      }
      await loadStories(false);
    } catch (error: any) {
      setErrorMessage(toUiErrorMessage(error, "Story action failed"));
    } finally {
      setActionState(null);
    }
  };

  const topicNameById = useMemo(() => {
    return new Map<number, string>((topics || []).map((topic: any) => [Number(topic.id), String(topic.name)]));
  }, [topics]);

  const filteredStories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return stories;

    return stories.filter((story) => {
      const topicName = topicNameById.get(Number(story.topic_id)) || story.topic_name || "";
      const haystack = [story.title, story.story_type, story.status, topicName].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [stories, searchTerm, topicNameById]);

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedStories = useMemo(() => {
    const offset = (currentPage - 1) * PAGE_SIZE;
    return filteredStories.slice(offset, offset + PAGE_SIZE);
  }, [filteredStories, currentPage]);

  const selectedStoryIdSet = useMemo(() => new Set(selectedStoryIds), [selectedStoryIds]);

  const allCurrentPageSelected =
    paginatedStories.length > 0 && paginatedStories.every((story) => selectedStoryIdSet.has(story.id));

  const toggleStorySelection = (storyId: number) => {
    setSelectedStoryIds((prev) => (prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]));
  };

  const toggleSelectCurrentPage = () => {
    const pageIds = paginatedStories.map((story) => Number(story.id));
    if (allCurrentPageSelected) {
      setSelectedStoryIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      return;
    }
    setSelectedStoryIds((prev) => {
      const merged = new Set(prev);
      pageIds.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedStoryIds.length === 0) return;
    setActionState({ type: "bulk_delete" });
    try {
      await storyApi.bulkDelete(selectedStoryIds);
      setSelectedStoryIds([]);
      await loadStories(false);
    } catch (error: any) {
      setErrorMessage(toUiErrorMessage(error, "Bulk delete stories failed"));
    } finally {
      setActionState(null);
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(0, currentPage - 3) + 5,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Stories</h1>
          <p className="text-zinc-500 mt-1">Review, publish, and manage generated newsroom stories.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 border rounded-md text-red-700 border-red-200 bg-red-50 disabled:opacity-60"
            onClick={handleBulkDelete}
            disabled={selectedStoryIds.length === 0 || !!actionState}
          >
            {actionState?.type === "bulk_delete" ? "Deleting..." : `Bulk delete (${selectedStoryIds.length})`}
          </button>
          <button className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-60" onClick={handleRefresh} disabled={refreshing || !!actionState}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-2">Search stories</label>
        <input
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Search by title, topic, type, status..."
          value={searchTerm}
          disabled={!!actionState}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
        />
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
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={toggleSelectCurrentPage}
                  disabled={loading || paginatedStories.length === 0 || !!actionState}
                />
              </th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Topic</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : (
              paginatedStories.map((story) => (
                <tr key={story.id} className="border-t">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStoryIdSet.has(story.id)}
                      onChange={() => toggleStorySelection(story.id)}
                      disabled={!!actionState}
                    />
                  </td>
                  <td className="px-4 py-3">{story.title}</td>
                  <td className="px-4 py-3">{topicNameById.get(Number(story.topic_id)) || story.topic_name || `#${story.topic_id}`}</td>
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
            {!loading && paginatedStories.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-zinc-500" colSpan={6}>
                  No stories found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {(currentPage - 1) * PAGE_SIZE + (paginatedStories.length > 0 ? 1 : 0)}-
          {(currentPage - 1) * PAGE_SIZE + paginatedStories.length} of {filteredStories.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border rounded disabled:opacity-60"
            disabled={currentPage <= 1 || !!actionState}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`px-3 py-1.5 border rounded ${page === currentPage ? "bg-zinc-900 text-white border-zinc-900" : ""}`}
              disabled={!!actionState}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1.5 border rounded disabled:opacity-60"
            disabled={currentPage >= totalPages || !!actionState}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
