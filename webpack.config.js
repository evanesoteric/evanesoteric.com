const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = (env) => {
  const plugins = [
    new HtmlWebpackPlugin({
      title: "Evanesoteric",
      filename: "index.html",
      template: "src/index.html",
      favicon: "src/assets/img/favicon.webp",
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: "assets/css/[name].[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/robots.txt", to: "robots.txt" },
        { from: "src/gpg.txt", to: "gpg.txt" },
        { from: "src/assets/img/favicon.webp", to: "assets/img/favicon.webp" },
        {
          from: "src/assets/img/opengraph.webp",
          to: "assets/img/opengraph.webp",
        },
        { from: "src/assets/img/icons", to: "assets/img/icons" },
      ],
    }),
  ];

  // Only add BundleAnalyzerPlugin if ANALYZE environment variable is set to 'true'
  if (process.env.ANALYZE === "true") {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return {
    mode: "production",
    entry: {
      bundle: path.resolve(__dirname, "src/assets/js/index.js"),
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "assets/js/[name][contenthash].js",
      clean: true,
      assetModuleFilename: "[name][ext]",
    },
    plugins: plugins,
    devtool: "source-map",
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },
      port: 3000,
      open: true,
      hot: true,
      compress: true,
      historyApiFallback: true,
      client: {
        logging: "none", // Keeps the logging setting as is, to not log anything to the browser console
        overlay: {
          errors: true,
          warnings: true, // Set this to true to enable the overlay for warnings
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.(scss|css)$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/img/[name].[hash][ext][query]",
          },
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/fonts/[name].[hash][ext][query]",
          },
        },
        {
          test: /\.html$/,
          loader: "html-loader",
          options: {
            sources: {
              list: [
                {
                  tag: "img",
                  attribute: "src",
                  type: "src",
                },
              ],
            },
            minimize: true,
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new CssMinimizerPlugin(), "..."],
    },
    stats: env && env.ERROR_LOGGING === "none" ? "errors-only" : "normal",
  };
};
