export interface ScheduleConfig {
  hour: number;
  minute: number;
}

export interface ScheduleStatusResponse {
  status: string;
  job_id?: string;
  next_run_time?: string;
  message?: string;
}

export interface RunNowResponse {
  status: string;
  message?: string;
  research?: any;
  harvest?: any;
}

const INTERNAL_SCHEDULE_ENDPOINT = "/api/schedule";
const INTERNAL_RUN_NOW_ENDPOINT = "/api/schedule/run-now";

const fetchSchedule = async (options: RequestInit = {}): Promise<ScheduleStatusResponse> => {
  const res = await fetch(INTERNAL_SCHEDULE_ENDPOINT, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({
    status: "error",
    message: "Không đọc được phản hồi từ backend schedule.",
  }));

  if (!res.ok) {
    throw new Error(data.message || data.detail || "Schedule API request failed");
  }

  return data;
};

export const scheduleApi = {
  getSchedule: async (): Promise<ScheduleStatusResponse> => {
    return fetchSchedule({ method: "GET" });
  },

  updateSchedule: async (config: ScheduleConfig): Promise<ScheduleStatusResponse> => {
    return fetchSchedule({
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  runNow: async (): Promise<RunNowResponse> => {
    const res = await fetch(INTERNAL_RUN_NOW_ENDPOINT, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({
      status: "error",
      message: "Không đọc được phản hồi run now.",
    }));

    if (!res.ok) {
      throw new Error(data.message || "Run now request failed");
    }

    return data;
  },
};
