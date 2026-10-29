# Pautang Version 1.31 — GitHub Pages Edition

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
