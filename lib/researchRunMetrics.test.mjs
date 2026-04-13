import assert from "node:assert/strict";

import { getResearchRunMetrics } from "./researchRunMetrics.js";

const tests = [
  {
    name: "getResearchRunMetrics computes success and failure rates from finished runs",
    run() {
      const metrics = getResearchRunMetrics([
        { status: "completed" },
        { status: "COMPLETED" },
        { status: "failed" },
        { status: "running" },
        { status: "queued" },
      ]);

      assert.equal(metrics.total, 5);
      assert.equal(metrics.completed, 2);
      assert.equal(metrics.failed, 1);
      assert.equal(metrics.active, 2);
      assert.equal(metrics.finished, 3);
      assert.equal(metrics.successRate, 66.67);
      assert.equal(metrics.failureRate, 33.33);
    },
  },
  {
    name: "getResearchRunMetrics returns zero rates when no finished runs exist",
    run() {
      const metrics = getResearchRunMetrics([
        { status: "running" },
        { status: "queued" },
      ]);

      assert.equal(metrics.finished, 0);
      assert.equal(metrics.successRate, 0);
      assert.equal(metrics.failureRate, 0);
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
