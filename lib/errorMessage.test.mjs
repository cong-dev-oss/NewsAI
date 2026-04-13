import assert from "node:assert/strict";

import { extractApiErrorMessage } from "./errorMessage.js";

assert.equal(extractApiErrorMessage({ detail: "Simple error" }, "Fallback"), "Simple error");
assert.equal(
  extractApiErrorMessage({ detail: { message: "Nested message" } }, "Fallback"),
  "Nested message",
);
assert.equal(
  extractApiErrorMessage(
    { detail: [{ loc: ["body", "ids"], msg: "field required", type: "missing" }] },
    "Fallback",
  ),
  "body.ids: field required",
);
assert.equal(extractApiErrorMessage({}, "Fallback"), "Fallback");

console.log("error message extraction checks passed");
