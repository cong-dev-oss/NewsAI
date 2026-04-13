import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const apiFile = readFileSync("lib/api.ts", "utf8");

assert.match(apiFile, /story\.topic_name/);
assert.match(apiFile, /story\.effective_hero_image/);

console.log("story category and image mapping checks passed");
