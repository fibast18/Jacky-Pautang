# Cumulative-update rules — Pautang

1. **Baseline:** Version 1.31 (2026-10-29) is the starting version. No feature removal or unrequested redesign in subsequent releases.
2. **Distribution:** Provide a full ZIP for GitHub upload, with `index.html` and its dependencies at the repository root. Don't deliver partial snippets as a release.
3. **Persistent records:** Keep the localStorage key `pautang-github-data-v1`, all existing saved records and their fields. Do not clear/reset localStorage during upgrades. Retain valid existing backup import/export files.
4. **Version markers:** Bump the visible app footer, app backup `app_version`, any versioned import copy, service worker cache key and release documentation together. Versions after this baseline should move forward (e.g. 1.32 for the next feature release).
5. **Offline support:** Preserve the web manifest and offline service worker. A *first-ever* visit to a GitHub Pages URL requires the internet to download/install the app; later launches can work offline, subject to the browser retaining storage/cache.
6. **Backups:** Encourage a JSON backup before updating, switching URLs/domains, clearing browser data or replacing devices. Local data belongs to the exact browser origin/path context; changing Cloudflare to GitHub or changing device will not carry data automatically.
7. **Verification:** At each release validate JS syntax, asset references, manifest JSON, archived paths, offline cache/version changes, and backup-format compatibility; perform real-device testing when possible.
8. **Security:** GitHub Pages with a public repository is publicly accessible. This baseline has no authentication or synced cloud storage. Device-local records are not automatically uploaded to GitHub.

9. **Version 1.32:** Preserve the restored personalized greeting and separate profile storage on all future cumulative updates.
