const COMPLETED_STATUSES = new Set(["completed", "success", "succeeded"]);
const FAILED_STATUSES = new Set(["failed", "error"]);
const ACTIVE_STATUSES = new Set(["running", "queued", "pending", "in_progress"]);

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const toPercent = (value) => Math.round(value * 100) / 100;

export function getResearchRunMetrics(runs = []) {
  let completed = 0;
  let failed = 0;
  let active = 0;

  for (const run of runs) {
    const status = normalizeStatus(run?.status);
    if (COMPLETED_STATUSES.has(status)) {
      completed += 1;
      continue;
    }
    if (FAILED_STATUSES.has(status)) {
      failed += 1;
      continue;
    }
    if (ACTIVE_STATUSES.has(status)) {
      active += 1;
    }
  }

  const total = runs.length;
  const finished = completed + failed;
  const successRate = finished > 0 ? toPercent((completed / finished) * 100) : 0;
  const failureRate = finished > 0 ? toPercent((failed / finished) * 100) : 0;

  return {
    total,
    completed,
    failed,
    active,
    finished,
    successRate,
    failureRate,
  };
}
