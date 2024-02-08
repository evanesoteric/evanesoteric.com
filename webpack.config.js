const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: {
    bundle: path.resolve(__dirname, 'src/assets/js/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name][contenthash].js',
    clean: true,
    assetModuleFilename: '[name][ext]',
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash][ext][query]'
        }
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          sources: {
            list: [
              {
                tag: 'img',
                attribute: 'src',
                type: 'src',
              },
            ],
          },
          minimize: true,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'evanesoteric',
      filename: 'index.html',
      template: 'src/index.html',
      favicon: 'src/assets/img/favicon.png',
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash].css',
    }),
    new CopyPlugin({
        patterns: [
          { from: 'src/robots.txt', to: 'robots.txt' },
          { from: 'src/gpg.txt', to: 'gpg.txt' }
        ],
      }),
    new BundleAnalyzerPlugin(),
  ],
  optimization: {
    minimize: true, // Enable minimization
    minimizer: [
      new CssMinimizerPlugin(),
      '...', // Use the default JS minimizer alongside the custom CSS minimizer
    ],
  },
};
