const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    search: './src/js/search/search.js',
    chat: './src/js/chat/AIchat.js',
    connections: './src/js/services/connectionManager.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['search', 'chat']
    }),
    new HtmlWebpackPlugin({
      template: './src/html/connections.html',
      filename: 'connections.html',
      chunks: ['connections']
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: 'src/css',
          to: 'css' 
        }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'src')
    },
    hot: true,
    open: true,
    port: 8000,
    watchFiles: ['src/**/*.html', 'src/**/*.css']
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@js': path.resolve(__dirname, './src/js'),
      '@css': path.resolve(__dirname, './src/css'),
      '@utils': path.resolve(__dirname, './src/js/utils'),
      '@services': path.resolve(__dirname, './src/js/services'),
      '@search': path.resolve(__dirname, './src/js/search')
    }
  }
};