const CopyPlugin = require("copy-webpack-plugin");
const { join } = require('path')

module.exports = {
  mode: 'development',
  devtool: "inline-source-map",
  entry: {
    background: join(__dirname, "background.ts"),
    button: join(__dirname, "button.ts")
  },
  output: {
    path: join(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: ['.ts', '.js'],
   
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: '*.html', to: '[name][ext]'},
        { from: "manifest.json", to: "manifest.json" },
      ],
    }),
  ],
};
