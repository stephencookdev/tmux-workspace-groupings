const path = require("path");
const fs = require("fs");
const nodeExternals = require("webpack-node-externals");

const entryDir = path.resolve(__dirname, "scripts/entry");
const files = fs.readdirSync(entryDir);

module.exports = {
  entry: Object.fromEntries(files.map((f) => [f, path.resolve(entryDir, f)])),
  target: "node",
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  output: {
    filename: "[name]",
    path: path.resolve(__dirname, "dist"),
  },
  externals: [nodeExternals()],
};
