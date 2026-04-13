import { NextResponse } from "next/server";

import { fetchFromNewsApi } from "@/lib/newsApi";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetchFromNewsApi(`/stories/${id}`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(null, { status: 404 });
  }
}
