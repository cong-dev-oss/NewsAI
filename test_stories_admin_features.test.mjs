import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const storiesPage = readFileSync("app/admin/stories/page.tsx", "utf8");
const storyApi = readFileSync("lib/storyApi.ts", "utf8");

assert.match(storiesPage, /searchTerm/);
assert.match(storiesPage, /selectedStoryIds/);
assert.match(storiesPage, /Bulk delete/);
assert.match(storiesPage, /currentPage/);
assert.match(storiesPage, /topicNameById/);

assert.match(storyApi, /bulkDelete/);
assert.match(storyApi, /listTopics/);

console.log("stories admin feature checks passed");
