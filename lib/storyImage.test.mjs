import assert from "node:assert/strict";

import { PLACEHOLDER_STORY_IMAGE, resolveStoryImage } from "./storyImage.js";

const tests = [
  {
    name: "resolveStoryImage falls back to local placeholder when empty",
    run() {
      assert.equal(resolveStoryImage({}), PLACEHOLDER_STORY_IMAGE);
      assert.equal(resolveStoryImage({ hero_image: null }), PLACEHOLDER_STORY_IMAGE);
      assert.equal(resolveStoryImage({ hero_image: "N/A" }), PLACEHOLDER_STORY_IMAGE);
    },
  },
  {
    name: "resolveStoryImage keeps absolute HTTP URL",
    run() {
      const url = "https://cdn.example.com/a.jpg";
      assert.equal(resolveStoryImage({ hero_image: url }), url);
    },
  },
  {
    name: "resolveStoryImage resolves relative path with API base",
    run() {
      assert.equal(
        resolveStoryImage({ hero_image: "/uploads/a.jpg" }, { apiBase: "http://127.0.0.1:8010/" }),
        "http://127.0.0.1:8010/uploads/a.jpg",
      );
      assert.equal(
        resolveStoryImage({ image_url: "uploads/b.jpg" }, { apiBase: "http://127.0.0.1:8010" }),
        "http://127.0.0.1:8010/uploads/b.jpg",
      );
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
