import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const apiText = readFileSync("lib/api.ts", "utf8");
const articlePageText = readFileSync("app/article/[id]/page.tsx", "utf8");

assert.match(apiText, /highlights:\s*Array\.isArray\(story\.highlights\)/);
assert.match(apiText, /story_type:\s*story\.story_type \|\| ""/);
assert.match(articlePageText, /article\.story_type === "roundup"/);
assert.match(articlePageText, /Tổng hợp nhanh theo từng ý/);
assert.match(articlePageText, /roundupHighlights\.map/);
assert.match(articlePageText, /normalizeCompareText/);
assert.doesNotMatch(articlePageText, /-\s*\{item\.title\}/);

console.log("roundup highlights rendering checks passed");
