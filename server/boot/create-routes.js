var path = require('path');
var express = require('express');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var config = require('../../client/webpack.config');

module.exports = function(app) {
  // configure hot reloading for development
  var compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));

  // configure routes
  app.use('/static', express.static(path.join(__dirname, '../../client/dist')));

  app.get('/status', function(req, res) {
    res.send(app.loopback.status());
  });

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
  });

  // return the index for any non-api call
  app.get(/^\/((?!api).)/, function(req, res) {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
  });
};
