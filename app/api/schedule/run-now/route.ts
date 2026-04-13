import { NextResponse } from "next/server";
import { getJobApiBase, ENV } from "@/lib/env";

const getServerHeaders = (): HeadersInit => {
  return ENV.API_KEY ? { "X-Job-API-Key": ENV.API_KEY } : {};
};

type RunNowPayload = {
  research_topic?: string;
  research_sources?: string;
  research_depth?: string;
  harvest_profile?: string;
  harvest_topic?: string;
};

export async function POST(request: Request) {
  let payload: RunNowPayload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const researchBody = {
    topic: payload.research_topic || "best web frameworks 2026",
    sources: payload.research_sources || "reddit,hn,youtube,web",
    depth: payload.research_depth || "quick",
  };

  const harvestBody = {
    profile: payload.harvest_profile || "dev",
    topic: payload.harvest_topic || "backend engineer",
  };

  try {
    const [researchRes, harvestRes] = await Promise.all([
      fetch(`${getJobApiBase()}/v1/research/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getServerHeaders(),
        },
        body: JSON.stringify(researchBody),
      }),
      fetch(`${getJobApiBase()}/v1/harvest/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getServerHeaders(),
        },
        body: JSON.stringify(harvestBody),
      }),
    ]);

    const researchData = await researchRes.json().catch(() => ({ status: "error" }));
    const harvestData = await harvestRes.json().catch(() => ({ status: "error" }));

    const ok = researchRes.ok && harvestRes.ok;
    return NextResponse.json(
      {
        status: ok ? "success" : "partial_error",
        message: ok
          ? "Đã trigger research và harvest thành công."
          : "Một hoặc nhiều job trigger thất bại.",
        research: researchData,
        harvest: harvestData,
      },
      { status: ok ? 200 : 502 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Không thể kết nối Job API để trigger run now.",
      },
      { status: 502 }
    );
  }
}
