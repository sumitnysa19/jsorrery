var http = require('http');
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

app.use(require('morgan')('short'));

// Keep compiler in outer scope so the request handler can access
var compiler;

(function initWebpack() {
	var webpack = require('webpack');
	var webpackConfig = require('./webpack.config.js');
	compiler = webpack(webpackConfig);

	app.use(require('webpack-dev-middleware')(compiler, {
		noInfo: true, publicPath: webpackConfig.output.publicPath,
	}));

	app.use(require('webpack-hot-middleware')(compiler, {
		log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000,
	}));

	app.use(express.static(__dirname + '/'));
})();

// Mount the Eyes app static server under /eyes
try {
    const eyesRouter = require('./eyes/app/server');
    app.use('/eyes', eyesRouter);
} catch (e) {
    // Eyes app not available or failed to load; continue without it.
}

// Serve the generated index.html from webpack-dev-middleware (in-memory) in
// development, otherwise fall back to static files on disk (`dist/index.html` or `src/index.html`).
app.get('*', function root(req, res) {
	if (compiler && compiler.outputFileSystem && compiler.outputPath) {
		var filename = path.join(compiler.outputPath, 'index.html');
		try {
			compiler.outputFileSystem.readFile(filename, function (err, result) {
				if (!err && result) {
					res.set('content-type', 'text/html');
					res.send(result);
					return;
				}

				// if webpack didn't emit index.html (or read failed), try disk fallbacks
				var prod = path.join(__dirname, 'dist', 'index.html');
				var src = path.join(__dirname, 'src', 'index.html');
				if (fs.existsSync(prod)) return res.sendFile(prod);
				if (fs.existsSync(src)) return res.sendFile(src);
				return res.status(404).send('index.html not found');
			});
			return;
		} catch (e) {
			// fall through to disk fallbacks
		}
	}

	// Production / fallback - prefer dist, then src
	var prod = path.join(__dirname, 'dist', 'index.html');
	var src = path.join(__dirname, 'src', 'index.html');
	if (fs.existsSync(prod)) return res.sendFile(prod);
	if (fs.existsSync(src)) return res.sendFile(src);
	res.status(404).send('index.html not found');
});

if (require.main === module) {
	var server = http.createServer(app);
	server.listen(process.env.PORT || 2018, function onListen() {
		var address = server.address();
		console.log('Listening on: %j', address);
		console.log(' -> that probably means: http://localhost:%d', address.port);
	});
}
