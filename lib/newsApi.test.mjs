import assert from "node:assert/strict";

import { getNewsApiCandidates, fetchFromNewsApi } from "./newsApi.js";

const tests = [
  {
    name: "getNewsApiCandidates appends api v1 suffix and removes duplicates",
    run() {
      const candidates = getNewsApiCandidates({
        newsApiUrl: "http://127.0.0.1:8000",
        jobApiUrl: "http://127.0.0.1:8000/",
      });

      assert.deepEqual(candidates, [
        "http://127.0.0.1:8000/api/v1",
        "http://127.0.0.1:8010/api/v1",
      ]);
    },
  },
  {
    name: "fetchFromNewsApi falls back when the first base returns 404",
    async run() {
      const calls = [];

      global.fetch = async (url) => {
        calls.push(url);

        if (url === "http://127.0.0.1:8000/api/v1/articles/") {
          return new Response(JSON.stringify({ detail: "Not Found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (url === "http://127.0.0.1:8010/api/v1/articles/") {
          return new Response(JSON.stringify([{ id: 1, title: "Recovered" }]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        throw new Error(`Unexpected URL: ${url}`);
      };

      const response = await fetchFromNewsApi("/articles/", {}, {
        newsApiUrl: "http://127.0.0.1:8000",
        jobApiUrl: "http://127.0.0.1:8010",
      });

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), [{ id: 1, title: "Recovered" }]);
      assert.deepEqual(calls, [
        "http://127.0.0.1:8000/api/v1/articles/",
        "http://127.0.0.1:8010/api/v1/articles/",
      ]);
    },
  },
];

let failures = 0;

for (const test of tests) {
  try {
    await test.run();
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
