import assert from "node:assert/strict";

import { createRunNowFeedback } from "./pipelineRunFeedback.js";

const tests = [
  {
    name: "createRunNowFeedback reports no active pipeline configs",
    run() {
      const feedback = createRunNowFeedback({
        triggeredCount: 0,
        kickoffDetected: false,
      });

      assert.equal(feedback.kind, "info");
      assert.match(feedback.message, /No active pipeline configs/i);
    },
  },
  {
    name: "createRunNowFeedback warns when queue accepted but no run kicked off",
    run() {
      const feedback = createRunNowFeedback({
        triggeredCount: 2,
        kickoffDetected: false,
      });

      assert.equal(feedback.kind, "warning");
      assert.match(feedback.message, /worker.*offline/i);
    },
  },
  {
    name: "createRunNowFeedback confirms when run kicked off",
    run() {
      const feedback = createRunNowFeedback({
        triggeredCount: 1,
        kickoffDetected: true,
      });

      assert.equal(feedback.kind, "success");
      assert.match(feedback.message, /started/i);
    },
  },
];

let failures = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error);
  }
}

if (failures > 0) {
  process.exit(1);
}
