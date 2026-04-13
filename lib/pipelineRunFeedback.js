export function createRunNowFeedback({
  triggeredCount = 0,
  kickoffDetected = false,
  targetLabel = "pipeline",
} = {}) {
  if (triggeredCount <= 0) {
    return {
      kind: "info",
      message: "No active pipeline configs to run. Please check pipeline status first.",
    };
  }

  if (kickoffDetected) {
    return {
      kind: "success",
      message: `Triggered ${triggeredCount} ${targetLabel}. Research run started successfully.`,
    };
  }

  return {
    kind: "warning",
    message:
      `Triggered ${triggeredCount} ${targetLabel}, but no new research run appeared yet. ` +
      "Queue may be waiting because Celery worker is offline.",
  };
}
