import { NextRequest, NextResponse } from "next/server";

import { fetchFromNewsApi } from "@/lib/newsApi";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;

  try {
    const response = await fetchFromNewsApi(`/stories/${search}`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => []);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
