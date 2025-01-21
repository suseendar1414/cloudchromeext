const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: path.resolve(__dirname, './src/background.js'),
    popup: path.resolve(__dirname, './src/popup.js'),
    analytics: path.resolve(__dirname, './src/analytics.js')
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new Dotenv({
      systemvars: true,
      safe: true,
      // Add these options for better .env handling
      defaults: true,
      path: path.resolve(__dirname, '.env')
    }),
    // This DefinePlugin might be redundant since Dotenv handles it
    // but we'll keep it as a fallback
    new webpack.DefinePlugin({
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY)
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/popup.html", to: "popup.html" },
        { from: "src/aws-sdk.min.js", to: "aws-sdk.min.js" }
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  chrome: '88'
                },
                modules: 'commonjs'
              }]
            ]
          }
        }
      }
    ]
  }
};