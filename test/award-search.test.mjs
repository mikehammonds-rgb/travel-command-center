import assert from "node:assert/strict";
import test from "node:test";
import handler from "../api/award-search.js";
import { buildCachedSearchUrl, searchCachedAwardAvailability } from "../lib/seats-aero.mjs";

test("cached search uses the documented Seats.aero endpoint and server authorization header", async () => {
  let request;
  const result = await searchCachedAwardAvailability({ origin: "MCO", destination: "LHR", take: 25 }, {
    apiKey: "test-secret",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ data: [{ ID: "availability-1" }] }), {
        headers: { "x-ratelimit-remaining": "999" },
      });
    },
  });
  assert.equal(request.url.origin + request.url.pathname, "https://seats.aero/partnerapi/search");
  assert.equal(request.url.searchParams.get("origin_airport"), "MCO");
  assert.equal(request.options.headers["Partner-Authorization"], "test-secret");
  assert.deepEqual(result.data, { data: [{ ID: "availability-1" }] });
  assert.equal(result.rateLimitRemaining, "999");
});

test("search URL omits optional parameters and uses documented names", () => {
  const url = buildCachedSearchUrl({ origin: "MCO", destination: "LHR", take: 100, direct: false });
  assert.equal(url.searchParams.get("origin_airport"), "MCO");
  assert.equal(url.searchParams.get("destination_airport"), "LHR");
  assert.equal(url.searchParams.get("only_direct_flights"), null);
});

test("search URL preserves valid zero-valued query options", () => {
  const url = buildCachedSearchUrl({ origin: "MCO", destination: "LHR", take: 10, skip: 0, minCabinPct: 0 });
  assert.equal(url.searchParams.get("skip"), "0");
  assert.equal(url.searchParams.get("min_cabin_pct"), "0");
});

test("award endpoint rejects malformed input before calling Seats.aero", async () => {
  const response = mockResponse();
  await handler({ method: "GET", query: { origin: "Miami", destination: "LHR" } }, response);
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { error: "origin_and_destination_required" });
});

function mockResponse() {
  return {
    headers: new Map(), statusCode: null, body: null,
    setHeader(name, value) { this.headers.set(name, value); },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}
