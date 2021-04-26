
const
  path = require('path'),
  webpack = require('webpack');

const config = {
  entry: './src/scripts/build.js',
  output: {
    path: path.resolve(__dirname, 'docs/build/'),
    filename: 'rmr-search.bundle.js'
  },
  mode: 'development',
  watch: true,
  plugins : [
  ],
  module: {
    rules: [
    ]
  }
};

module.exports = config;
