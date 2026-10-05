# Travel Command Center agent startup

- Canonical working folder: Google Drive → My Drive → Travel Command Center. Read `START_HERE.md` and `WORKFLOW.md` before task actions, then `README.md` and `SITEMAP.md` for app boundaries.
- Verify `site.config.json` and Git remote: `mikehammonds-rgb/travel-command-center`; hosting project `travel-command-center`; live URL `https://mike-travel-command-center.vercel.app`. This is not Club Royale Offer Compass.
- Preserve existing changes. Compare with current GitHub `main` before publication: connector-published changes may already be live even if local Git status is dirty. Never force-push or bulk-publish unrelated files.
- Read `TRIP_SCHEMA.md` for itinerary changes and `AI_HANDOFF.md` for award-search changes. Edit source modules, not generated `data/trips.js`; preserve all other trips and archives.
- Google Drive sync does not publish the website. Follow the approved GitHub/Vercel workflow and verify the exact deployed commit when a release is required.
- Do not store credentials or private booking inputs anywhere in this synced source folder. Git ignore does not prevent Drive syncing. Keep private information out of the public GitHub repository; preserve only the owner's documented `publicTravelParty` exception.
- Run `npm test` and `npm run check` for changes. Do not bump the runtime release for documentation-only edits.
- Do not book, cancel, check in, contact travel providers, change access protection, or delete recovery copies without explicit authorization.
