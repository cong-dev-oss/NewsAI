"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const rows = await api.getTopics();
      setTopics(Array.isArray(rows) ? rows : []);
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const createTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    setCreatingTopic(true);
    try {
      await api.createTopic({ name: name.trim() });
      setName("");
      setErrorMessage("");
      await loadTopics();
    } catch (error: any) {
      setErrorMessage(error?.message || "Create topic failed");
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    setDeletingTopicId(topicId);
    try {
      await api.deleteTopic(topicId);
      setErrorMessage("");
      await loadTopics();
    } catch (error: any) {
      const message = error?.message || "Delete topic failed";
      setErrorMessage(message);
    } finally {
      setDeletingTopicId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Topics</h1>
        <p className="text-zinc-500 mt-1">Manage editorial topics used by the newsroom pipelines.</p>
      </div>

      <form onSubmit={createTopic} className="bg-white border rounded-xl p-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Topic name"
          disabled={creatingTopic}
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-60" disabled={creatingTopic}>
          {creatingTopic ? "Adding..." : "Add"}
        </button>
      </form>

      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <div className="bg-white border rounded-xl divide-y">
        {loadingTopics ? (
          <div className="px-4 py-6 text-sm text-zinc-500">Loading topics...</div>
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className="px-4 py-3 flex items-center justify-between">
              <span>{topic.name}</span>
              <button
                className="text-sm text-red-600 disabled:opacity-60"
                disabled={deletingTopicId !== null}
                onClick={() => handleDeleteTopic(topic.id)}
              >
                {deletingTopicId === topic.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        )}
        {!loadingTopics && topics.length === 0 && <div className="px-4 py-6 text-sm text-zinc-500">No topics yet.</div>}
      </div>
    </div>
  );
}
