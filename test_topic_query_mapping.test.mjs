import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const apiFile = readFileSync("lib/api.ts", "utf8");
const latestFile = readFileSync("app/latest/LatestPage.tsx", "utf8");

assert.match(apiFile, /topic_name: topic/);
assert.match(apiFile, /return getStories\(limit, category, undefined, status\);/);
assert.match(latestFile, /getStories\(30, catFilter\)/);

console.log("topic query mapping checks passed");
