import { NextResponse } from "next/server";
import { getJobApiBase, ENV } from "@/lib/env";

const getServerHeaders = (): HeadersInit => {
  return ENV.API_KEY ? { "X-Job-API-Key": ENV.API_KEY } : {};
};

const isValidSchedule = (hour: unknown, minute: unknown): boolean => {
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
  return Number(hour) >= 0 && Number(hour) <= 23 && Number(minute) >= 0 && Number(minute) <= 59;
};

export async function GET() {
  try {
    const res = await fetch(`${getJobApiBase()}/v1/schedule`, {
      method: "GET",
      cache: "no-store",
      headers: getServerHeaders(),
    });

    const data = await res.json().catch(() => ({
      status: "error",
      message: "Không đọc được phản hồi từ Scheduler API.",
    }));

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Không thể kết nối Scheduler API.",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  let payload: { hour?: unknown; minute?: unknown } = {};

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Body JSON không hợp lệ.",
      },
      { status: 400 }
    );
  }

  const { hour, minute } = payload;
  if (!isValidSchedule(hour, minute)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Giờ chạy không hợp lệ. hour: 0-23, minute: 0-59.",
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${getJobApiBase()}/v1/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getServerHeaders(),
      },
      body: JSON.stringify({
        hour: Number(hour),
        minute: Number(minute),
      }),
    });

    const data = await res.json().catch(() => ({
      status: "error",
      message: "Không đọc được phản hồi từ Scheduler API.",
    }));

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Không thể kết nối Scheduler API.",
      },
      { status: 502 }
    );
  }
}
