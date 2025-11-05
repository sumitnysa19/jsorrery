// Minimal runtime config for Eyes app (override as needed)
// The app expects a global `window.config` object.
window.config = window.config || {};
// For local dev, point to NASA Eyes production asset roots so the app can fetch
// required models, textures, and data over the network from the browser.
// If you have a local mirror, replace these with local URLs.
// Route asset requests through the local /eyes proxy so the server
// can add required headers and avoid CORS/403 issues.
window.config.staticAssetsUrl = "/eyes";
window.config.dynamicAssetsUrl = "/eyes";
window.config.animdataUrl = "/eyes";
