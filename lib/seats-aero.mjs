const API_URL = "https://seats.aero/partnerapi/search";

export class SeatsAeroError extends Error {
  constructor(code, statusCode) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function buildCachedSearchUrl(options) {
  const url = new URL(API_URL);
  const params = {
    origin_airport: options.origin,
    destination_airport: options.destination,
    start_date: options.startDate,
    end_date: options.endDate,
    cabins: options.cabins,
    sources: options.sources,
    only_direct_flights: options.direct ? "true" : undefined,
    order_by: options.orderBy,
    take: String(options.take),
    cursor: options.cursor,
    skip: options.skip !== undefined ? String(options.skip) : undefined,
    min_cabin_pct: options.minCabinPct !== undefined ? String(options.minCabinPct) : undefined,
    minify_trips: options.includeTrips ? "true" : undefined,
    include_trips: options.includeTrips ? "true" : undefined,
  };

  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(name, value);
  }
  return url;
}

export async function searchCachedAwardAvailability(options, { apiKey, fetchImpl = fetch } = {}) {
  if (!apiKey) throw new SeatsAeroError("award_service_not_configured", 503);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  let response;
  try {
    response = await fetchImpl(buildCachedSearchUrl(options), {
      headers: {
        Accept: "application/json",
        "Partner-Authorization": apiKey,
      },
      signal: controller.signal,
    });
  } catch {
    throw new SeatsAeroError("award_service_unavailable", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new SeatsAeroError("award_service_auth_failed", 502);
    }
    if (response.status === 429) throw new SeatsAeroError("award_service_rate_limited", 429);
    throw new SeatsAeroError("award_search_failed", 502);
  }

  try {
    return {
      data: await response.json(),
      rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
    };
  } catch {
    throw new SeatsAeroError("award_service_invalid_response", 502);
  }
}
