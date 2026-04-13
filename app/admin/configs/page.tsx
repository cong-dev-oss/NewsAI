"use client";

import Link from "next/link";

export default function ConfigsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">
          System settings have been split into dedicated newsroom workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/topics" className="block p-5 rounded-xl border bg-white hover:bg-zinc-50">
          <h2 className="font-semibold">Topics</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage editorial topics.</p>
        </Link>
        <Link href="/admin/pipeline" className="block p-5 rounded-xl border bg-white hover:bg-zinc-50">
          <h2 className="font-semibold">Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-1">Configure source + topic schedules.</p>
        </Link>
        <Link href="/admin/stories" className="block p-5 rounded-xl border bg-white hover:bg-zinc-50">
          <h2 className="font-semibold">Stories</h2>
          <p className="text-sm text-zinc-500 mt-1">Review and publish generated stories.</p>
        </Link>
      </div>
    </div>
  );
}
