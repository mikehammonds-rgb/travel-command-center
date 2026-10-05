# Start here: Travel Command Center

Updated October 5, 2026, after the move to Google Drive.

## Where the project lives

- Working files: **Google Drive → My Drive → Travel Command Center**.
- Private Drive folder: find the folder above in My Drive; keep its private sharing state unchanged.
- Published source and history: `mikehammonds-rgb/travel-command-center` on GitHub, branch `main`.
- Hosting project: `travel-command-center` on Vercel.
- Live dashboard: https://mike-travel-command-center.vercel.app

Google Drive is the synced working-folder location, not the website host. On the Mac, use its Google Drive for desktop folder. GitHub remains the published source of truth, and Vercel deploys from GitHub. A Drive edit alone does not update the live dashboard.

## Open the correct workspace

1. Make sure Google Drive for desktop is running and the project files are available on the Mac. Keep this folder available offline using Drive's controls when needed.
2. In Codex, add/open the local folder **Google Drive → My Drive → Travel Command Center** as a project. Do not select the recovery copy or the older China-named folder as a new workspace.
3. The existing ChatGPT project and a local Codex project are separate registrations. The file move does not automatically create the Codex project or move conversation history. As of this migration, the local Codex registration still needs to be completed in the app.
4. Read `AGENTS.md`, this file, `WORKFLOW.md`, and `SITEMAP.md`. Read `TRIP_SCHEMA.md` before editing trip details and `AI_HANDOFF.md` before editing award-flight search.
5. Check `site.config.json`, the Git remote, and current GitHub `main` before editing or publishing. Preserve all existing changes. Local Git status can include work already published through the GitHub connector; do not blindly commit every modified file.

The old chat's project-folder path links to the Drive folder for compatibility. An untouched, dated recovery copy was retained outside Drive. Neither is a second active workspace; continue work in the Drive folder. Do not remove the link or recovery copy without explicit approval and verification that existing chats no longer need them.

## Resume safely

- Let Drive finish syncing before starting and after saving. Avoid simultaneous edits or Git operations on multiple computers using this synced repository. If Drive creates conflict copies, stop and compare them with GitHub instead of overwriting files.
- Ask for the specific trip or feature if the request is unclear. This dashboard is not Club Royale Offer Compass.
- Use existing email/Drive confirmations only within the user's requested scope; keep private inputs out of public source.
- Keep credentials outside the entire synced folder, even when Git ignores them. Use Vercel environment variables for deployment and a non-synced local secret store or process environment for development.
- Follow `WORKFLOW.md` for changes and release verification.

## Local checks

Run these from the project folder with Node.js 20 or newer:

```sh
npm test
npm run check
```

For a static UI preview, run `python3 -m http.server 8000` from the project folder and open `http://localhost:8000`. This does not run Vercel API functions, test sign-in protection, or verify production deployment. Award-flight search needs the appropriate Vercel development/runtime environment; do not work around it by placing secrets in browser code.
