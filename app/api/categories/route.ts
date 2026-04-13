import { NextResponse } from "next/server";
import { fetchFromNewsApi } from "@/lib/newsApi";

export async function GET() {
  try {
    const res = await fetchFromNewsApi("/stories/categories", {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
