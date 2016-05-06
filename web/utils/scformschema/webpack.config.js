var path = require('path');

module.exports = {
  entry: {
    scformschema: './src/index.js',
    test : './test/test.js'
  },
  output: {
    library: 'sc-form-schema',
    libraryTarget: 'umd',
    filename: './dist/[name].js'
  },
  externals: {
    'react-native': 'react-native'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel'
      }
    ]
  }
};
