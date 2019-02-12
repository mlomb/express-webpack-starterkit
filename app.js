const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const devMode = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 8080;

var app = express();

app.set('trust proxy', 1); // Enable if using a proxy (like Nginx)
app.use(helmet());

if(devMode) {
	const webpack = require('webpack');
	const compiler = webpack(require("./webpack.config.js"));

	app.use(require('webpack-dev-middleware')(compiler, {
		writeToDisk: (filePath) => {
			return /views(\\|\/).*\.html$/.test(filePath);
		}
	}));
} else {
	app.all('/views/*', function (req, res, next) {
		// Disable direct access to the views folder
		res.status(403).end();
	});
	app.use(express.static('dist', {
		maxAge: '1y',
		dotfiles: 'deny'
	}));
}

app.set('views', path.join(__dirname, '/dist/views'));
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	res.render('index.html', {
		test: "EJS from Express"
	});
});
app.get('/page', function (req, res) {
	res.render('page.html');
});

app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});
