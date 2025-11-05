# Eyes Local App

Run the local dev server and open the prebuilt Eyes app under `/eyes/`.

- Start: `npm start`
- URL: `http://localhost:2018/eyes/`

Notes
- The server mounts an Express sub-app at `/eyes` (see `eyes/app/server.js`).
- It provides alias routes so index.html references resolve:
  - `/eyes/vendors.js` -> `/eyes/vendor.js`
  - `/eyes/vendors.css` -> `/eyes/vendor.css`
  - `/eyes/commons.js` -> `/eyes/common.js`
- A minimal `eyes/config.js` is included. Add runtime settings there if needed.
  - By default, it points asset base URLs to `https://eyes.nasa.gov/apps/solar-system` so the browser can fetch models/textures/data directly from NASA in dev.
  - If you have a local mirror of the assets, update `staticAssetsUrl`, `dynamicAssetsUrl`, and `animdataUrl` accordingly.

Public API
- A small wrapper is available as `window.Eyes` (see `eyes/api.js`). Example:
- `await Eyes.initReady()` — resolves when the app and scene are ready
- `Eyes.navigate('#/home')` — navigates using the router
- `Eyes.selectEntity('earth')` / `Eyes.unselect()` — selection manager
- `Eyes.toggleLayer('spacecraft', true)` — layer visibility
- `Eyes.setTime('2025-01-01T00:00:00Z')` — set simulation time
- `await Eyes.goToEntity('mars', { duration: 1.5 })` — camera transition
- `await Eyes.followEntity('iss')` / `Eyes.unfollow()` — camera follow

Readable source
- A readable `PreloadManager` is available at `eyes/src/PreloadManager.js`. It mirrors the current preload/embed behavior without altering runtime. This is the first step toward refactoring the bundled code to maintainable modules.
- It is not wired into `index.html` yet to avoid conflicts with the existing bundles. When ready, we can replace `preload.js` usage with this module and remove duplication.

Dev page
- `eyes/index-dev.html` loads the production bundles plus dev modules without changing runtime behavior.
- It exposes `window._EyesDev` with:
  - `PreloadManager` class for inspection/experimentation
  - `SolarSystemAppShell` and a helper `startShell()` to initialize the shell alongside the prod app (for exploration only)
- Adds `eyes/dev.css` to bias font-family to system fonts and avoid fetching missing local font files.
- Optional shim: `eyes/disable-dynamo.js` can be loaded on the dev page to completely suppress
  DynamoController network access and errors. This disables time-varying motion for planets/moons/spacecraft,
  allowing the UI to load without def.dyn files. Use only for UI exploration.

Troubleshooting
- If assets 404, ensure you’re using `/eyes/` path and that `npm start` is running on port 2018.
- Some icons in `index.html` may be optional and can 404 without impacting app startup.
