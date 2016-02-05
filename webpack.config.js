module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    devtool : 'source-map',
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: "babel"
              //query: {presets: ['react', 'es2015']}//what does this do
            },
            { test: /\.js$/, loader: 'jsx-loader' }
        ]
    }
};
