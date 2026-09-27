import { SeatsAeroError, searchCachedAwardAvailability } from "../lib/seats-aero.mjs";

const IATA_LIST = /^[A-Z]{3}(,[A-Z]{3})*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CABINS = new Set(["economy", "premium", "business", "first"]);
const ORDER_BY = new Set(["departure_date", "lowest_mileage"]);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const parsed = parseSearchQuery(req.query || {});
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  try {
    const result = await searchCachedAwardAvailability(parsed.options, {
      apiKey: process.env.SEATS_AERO_API_KEY,
    });
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    if (result.rateLimitRemaining !== null) {
      res.setHeader("X-Award-Search-Remaining", result.rateLimitRemaining);
    }
    return res.status(200).json({
      source: "Seats.aero cached search",
      results: result.data,
    });
  } catch (error) {
    if (error instanceof SeatsAeroError) {
      return res.status(error.statusCode).json({ error: error.code });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}

function parseSearchQuery(query) {
  const origin = airportList(query.origin);
  const destination = airportList(query.destination);
  if (!origin || !destination) return { error: "origin_and_destination_required" };

  const startDate = text(query.startDate);
  const endDate = text(query.endDate);
  if ((startDate && !DATE.test(startDate)) || (endDate && !DATE.test(endDate))) {
    return { error: "dates_must_use_yyyy_mm_dd" };
  }
  if (startDate && endDate && startDate > endDate) return { error: "start_date_must_not_follow_end_date" };

  const cabins = csv(query.cabins, CABINS);
  if (query.cabins && !cabins) return { error: "invalid_cabins" };
  const take = integer(query.take, 100, 10, 250);
  if (take === null) return { error: "take_must_be_between_10_and_250" };
  const direct = boolean(query.direct);
  if (query.direct !== undefined && direct === null) return { error: "direct_must_be_true_or_false" };
  const includeTrips = boolean(query.includeTrips);
  if (query.includeTrips !== undefined && includeTrips === null) return { error: "include_trips_must_be_true_or_false" };
  const orderBy = text(query.orderBy) || "departure_date";
  if (!ORDER_BY.has(orderBy)) return { error: "invalid_order_by" };
  const minCabinPct = integer(query.minCabinPct, undefined, 0, 100);
  if (minCabinPct === null) return { error: "min_cabin_pct_must_be_between_0_and_100" };
  const skip = integer(query.skip, 0, 0, 10_000);
  if (skip === null) return { error: "skip_must_be_between_0_and_10000" };
  const cursor = integer(query.cursor, undefined, 0, 2_147_483_647);
  if (cursor === null) return { error: "cursor_must_be_a_non_negative_integer" };

  return {
    options: {
      origin,
      destination,
      startDate,
      endDate,
      cabins,
      sources: csv(query.sources),
      direct: direct || false,
      orderBy,
      take,
      cursor: cursor === undefined ? "" : String(cursor),
      skip,
      minCabinPct,
      includeTrips: includeTrips || false,
    },
  };
}

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function airportList(value) { const airports = text(value).toUpperCase(); return IATA_LIST.test(airports) ? airports : ""; }
function csv(value, allowed) {
  const items = text(value).toLowerCase();
  if (!items) return "";
  const values = items.split(",");
  return values.every((item) => item && (!allowed || allowed.has(item))) ? values.join(",") : "";
}
function boolean(value) { if (value === undefined) return false; if (value === "true") return true; if (value === "false") return false; return null; }
function integer(value, fallback, min, max) {
  if (value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}
