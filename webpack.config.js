const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: { index: path.resolve(__dirname, "src", "index.js") },
  output: {
    filename: 'sailthru.main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  watch: true
};