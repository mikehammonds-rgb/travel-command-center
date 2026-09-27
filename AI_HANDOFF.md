# AI handoff: Seats.aero award search

## Purpose

`/api/award-search` is the Travel Command Center's server-side wrapper around the Seats.aero **cached search** API. It is appropriate for Mike's Pro account and must remain personal, non-commercial use. Do not replace it with Seats.aero Live Search: that endpoint requires a commercial agreement.

## Secret boundary

- The only credential name is `SEATS_AERO_API_KEY`.
- Set it in Vercel's Environment Variables for Production, Preview, and Development as appropriate; it is not committed to this repository.
- For local work, place it only in the ignored `.env.local`. Never put a real value in `.env.example`, Markdown, source, browser code, a commit, a screenshot, or a chat transcript.
- The server client in `lib/seats-aero.mjs` sends it only as Seats.aero's `Partner-Authorization` request header. It must never be returned to the browser or logged.

## API contract

`GET /api/award-search` accepts:

- required: `origin`, `destination` — one or more comma-separated IATA airport codes, such as `MCO,TPA` and `LHR,CDG`;
- optional: `startDate`, `endDate` (`YYYY-MM-DD`), `cabins` (`economy`, `premium`, `business`, `first`), `sources`, `direct`, `orderBy` (`departure_date` or `lowest_mileage`), `take` (10–250), `minCabinPct` (0–100), and `includeTrips`.

Example: `/api/award-search?origin=MCO,TPA&destination=LHR,CDG&startDate=2026-10-10&endDate=2026-10-18&cabins=business&take=50&orderBy=lowest_mileage`

The endpoint returns `{ source, results }`, where `results` is Seats.aero's JSON payload. It validates input before making the upstream request, maps provider errors to non-secret error codes, and caches successful responses for five minutes to preserve the Pro daily allowance. The dashboard's `Award Flights` button calls this same-origin endpoint; never call Seats.aero directly from `app.js`.

## Change and verification checklist

1. Keep the API request in `lib/seats-aero.mjs`; do not add the key to any public/client module.
2. Run `npm test` and `npm run check` after changes.
3. On Vercel, add/update the secret, deploy, then call a narrow search URL. Confirm a 200 response and that no response, build output, or browser bundle contains the secret.
4. Watch `X-Award-Search-Remaining` to avoid exhausting Seats.aero's daily quota. Do not log full provider failures or authorization headers.
