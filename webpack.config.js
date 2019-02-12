const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const dist = path.resolve(__dirname, 'dist');

const devMode = process.env.NODE_ENV !== 'production';
const pages = [
	'index',
	'page'
];
const styles = [
	'global.less',
	'index.css',
	'page.css'
];

module.exports = {
	mode: devMode ? 'development' : 'production',
	entry: pages.reduce((el, name) => {
		var path = `./src/views/${name}.js`;
		if (fs.existsSync(path))
			el[name] = [ path ];
		return el;
	}, {
		styles: styles.map(filename => {
			return `./assets/styles/${filename}`;
		})
	}),
	output: {
		path: dist,
		publicPath: '/',
		filename: "static/" + (devMode ? '[name].js' : '[name].[hash:8].js'),
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		},
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: devMode
			}),
			new OptimizeCSSAssetsPlugin()
		]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: devMode ? [] : { // Assume a recent browser during development
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
  			{
  				test: /\.(c|le)ss$/,
  				use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
  			},
			{
				test: /\.html$/,
				loader: 'html-loader'
			}
		],
	},
	plugins: [
		new CleanWebpackPlugin(dist),
		new FixStyleOnlyEntriesPlugin(),
		new MiniCssExtractPlugin({
			filename: "static/" + (devMode ? '[name].css' : '[name].[hash:8].css')
		}),
	].concat(pages.reduce((el, name) => {
		var path = `./views/${name}.html`;
		if (fs.existsSync(path)) {
			el.push(new HtmlWebpackPlugin({
				filename: path,
				template: path,
				chunks: ['vendors', 'styles', name],
				inject: true,
				showErrors: devMode
			}));
		}
		return el;
	}, [])).concat([
		new webpack.HashedModuleIdsPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	])
};
