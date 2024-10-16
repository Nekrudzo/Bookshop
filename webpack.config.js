const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
            },
          },
          "css-loader",
        ],
        test: /\.css$/,
      },
    ],
  },
};
