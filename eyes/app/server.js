const express = require('express');
const path = require('path');
const https = require('https');

// Express sub-app/router mounted at /eyes
const router = express.Router();

const eyesRoot = path.join(__dirname, '..');

// Serve static assets from the eyes folder
router.use(express.static(eyesRoot));

// Proxy helper to fetch NASA Eyes assets with appropriate headers
function proxyToNasa(req, res) {
  const base = 'https://eyes.nasa.gov/apps/solar-system';
  // req.baseUrl is '/eyes', req.path begins with asset path like '/dynamo/...'
  const url = base + req.path;

  const options = new URL(url);
  const headers = {
    'User-Agent': req.headers['user-agent'] || 'jsorrery-eyes-proxy',
    'Accept': req.headers['accept'] || '*/*',
    'Referer': 'https://eyes.nasa.gov/apps/solar-system/',
    'Origin': 'https://eyes.nasa.gov',
  };

  https.get({ ...options, headers }, (upstream) => {
    res.status(upstream.statusCode || 502);
    // Pass through content-type and caching headers
    const passHeaders = ['content-type', 'content-length', 'cache-control', 'expires', 'last-modified', 'etag'];
    passHeaders.forEach((h) => {
      if (upstream.headers[h]) res.setHeader(h, upstream.headers[h]);
    });
    upstream.pipe(res);
  }).on('error', (err) => {
    res.status(502).send('Proxy error: ' + err.message);
  });
}

// Asset proxy routes (must come before SPA catch-all)
const proxiedPrefixes = [
  '/dynamo/',
  '/cmts/',
  '/models/',
  '/stars/',
  '/maps/',
  '/sprites/',
  '/env_maps/',
  '/wasm/',
  '/animdata/',
];

router.get(proxiedPrefixes.map(p => p + '*'), proxyToNasa);

// Lightweight alias routes to match filenames referenced by index.html
// Map vendors.js -> vendor.js, vendors.css -> vendor.css, commons.js -> common.js
router.get('/vendors.js', (req, res) => {
  res.sendFile(path.join(eyesRoot, 'vendor.js'));
});

router.get('/vendors.css', (req, res) => {
  res.type('text/css').sendFile(path.join(eyesRoot, 'vendor.css'));
});

router.get('/commons.js', (req, res) => {
  res.sendFile(path.join(eyesRoot, 'common.js'));
});

// Directory index for /eyes/ -> eyes/index.html
router.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(eyesRoot, 'index.html'));
});

// Client-side routes (SPA): return index.html
router.get('*', (req, res) => {
  res.sendFile(path.join(eyesRoot, 'index.html'));
});

module.exports = router;
