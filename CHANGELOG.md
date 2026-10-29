# Pautang — cumulative release history

## Version 1.32 — 2026-10-29 (cumulative UI restoration)
- Restored the Home/Overview greeting above Total Fund, including the flower icon, local-time Good morning/afternoon/evening text, and display name.
- Initial display name is **Jacky G**, matching the supplied screenshot; tapping the greeting lets the user change the name.
- Saves greeting preferences separately under `pautang-profile-v1` without altering loans, clients, payments, or cash data.
- Version 1.32 JSON backups include an optional profile, but existing v1.31 backup format/schema version 1 remains importable.
- Bumped the app footer, backup metadata, service worker cache, README, and release file version to 1.32.
- All v1.31 application features and financial storage key remain unchanged.

## Version 1.31 — 2026-10-29 (baseline)
- Registered as the immutable starting point for all future cumulative releases.
- Packaged the **unchanged supplied app sources** with deployment and version-tracking files.
- Includes mobile overview and portfolio indicators, client register, loans/payments/additions/history, cash ledger, export/import JSON backups, PWA home-screen installation, and service worker offline caching after the first successful online launch.
- The "AI Analyst" and "AI Analytics" are built-in locally computed summaries; they are not connected to a paid AI service.
- Data is stored on each device/browser using localStorage key `pautang-github-data-v1`.
- Export format `pautang-backup` schema version `1`, application version `1.31-github`.
- Added `.github/workflows/deploy.yml`, `.nojekyll`, `VERSION.txt`, `RELEASE_POLICY.md`, `SOURCE_SHA256.txt` and this changelog to the upload-ready package. These release files do not modify application behavior.

## Future releases
- Record every version here in descending order, naming additions, fixes and migrations.
- Each new release must include the full current app and all existing working features.
- Maintain schema and backup compatibility; migrate explicitly when unavoidable, after a backup.
- Bump version in app footer, backup metadata, import instructions, and service worker cache key.
