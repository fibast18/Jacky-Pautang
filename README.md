# Pautang Version 1.32 — GitHub Pages Edition

This edition runs entirely in the phone browser. It has no login and no cloud database. All records are stored only on the device where the app is used.

## Publish on GitHub Pages

1. Create a new public repository on GitHub.
2. Upload every file and folder from this package to the repository root, including `.github` and `.nojekyll`.
3. Use `main` as the repository branch.
4. Open **Settings → Pages** in GitHub.
5. Under **Build and deployment**, select **GitHub Actions**.
6. Open the **Actions** tab and wait for “Deploy Pautang to GitHub Pages” to finish.
7. GitHub will provide the website address under **Settings → Pages**.

## Move existing records

1. In the current Cloudflare app, tap **⇅** and choose **Export backup**.
2. Open the new GitHub Pages app on the same phone.
3. Tap **⇅**, select the downloaded JSON file, and choose **Import backup**.
4. Confirm the totals before continuing to use the new app.

## Important backup warning

Records are stored only in the browser storage of that phone. Clearing website data, uninstalling the browser, resetting the phone, or losing the phone may erase them. Export a backup regularly and keep copies in another safe location.

The app works offline after it has been opened successfully once while online.

## v1.32 restored personalized greeting

The Home/Overview screen again shows a time-based greeting and a display name (initially `Jacky G!`). Tap the greeting to change the display name. The chosen name stays on this device under the separate `pautang-profile-v1` setting and does not modify financial entries.

Version 1.32 backups optionally include the profile, while imports of existing version 1.31 backups continue to work. The main financial data key is still `pautang-github-data-v1` and the backup schema is still version 1.

When updating the same GitHub Pages URL, keep the existing site address so on-device records remain available. Export a JSON backup *before* updating. Refresh the installed app once online after publishing so the new v1.32 offline cache can install.
