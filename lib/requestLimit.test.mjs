import assert from "node:assert/strict";

import { clampApiLimit } from "./requestLimit.js";

assert.equal(clampApiLimit(undefined), 50);
assert.equal(clampApiLimit(0), 1);
assert.equal(clampApiLimit(1), 1);
assert.equal(clampApiLimit(201), 200);
assert.equal(clampApiLimit(9999), 200);
assert.equal(clampApiLimit(150), 150);

console.log("request limit clamp checks passed");
