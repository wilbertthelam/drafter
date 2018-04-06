const path = require('path');

const CLIENT_DIR = path.join(__dirname, 'public', 'src');
const BUILD_DIR = path.join(__dirname, 'public', 'build');

module.exports = {
  context: CLIENT_DIR,
  entry: {
    draftClient: './clients/DraftClient/index',
    mainClient: './clients/MainClient/index',
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    }, {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    }],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  devtool: 'inline-source-map',
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/',
  },
  mode: 'development', // Change to prod on release
};
