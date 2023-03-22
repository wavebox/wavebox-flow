const path = require('path')
const fs = require('fs')
const CopyPlugin = require('copy-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CssClassnameGenerator = require('./webpack/CssClassnameGenerator')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function (env, argv) {
  const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json')))
  const isProduction = argv.mode === 'production'
  return {
    entry: './src/index.tsx',
    target: 'web',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'bin')
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /(\.css|\.less)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                modules: {
                  getLocalIdent: CssClassnameGenerator({ isProduction })
                }
              }
            },
            'less-loader'
          ]
        },
        {
          test: /\.(txt|md)$/,
          use: 'raw-loader'
        }
      ]
    },
    resolve: {
      extensions: ['*', '.ts', '.tsx', '.js', '.jsx', '.css', '.less', '.txt', '.md'],
      alias: Object.entries(tsConfig.compilerOptions.paths).reduce((acc, [name, loc]) => {
        const key = name.endsWith('/*') ? name.slice(0, -2) : name
        const value = path.join(
          __dirname,
          tsConfig.compilerOptions.baseUrl,
          loc[0].endsWith('/*') ? loc[0].slice(0, -2) : loc[0]
        )
        acc[key] = value
        return acc
      }, {})
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.ProvidePlugin({
        classes: ['£classes']
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        inject: 'body',
        scriptLoading: 'blocking',
        hash: true,
        cache: false,
        publicPath: '/'
      }),
      new CopyPlugin({
        patterns: [
          { from: './assets', to: 'assets' }
        ]
      }),
      new CaseSensitivePathsPlugin(),
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true,
        allowAsyncCycles: false
      }),
      new MiniCssExtractPlugin({ filename: 'index.css' })
    ],
    optimization: {
      minimize: isProduction,
      ...(isProduction
        ? {
            minimizer: [
              new TerserPlugin({
                extractComments: false,
                terserOptions: {
                  output: { comments: false },
                  compress: { }
                }
              }),
              new CssMinimizerPlugin()
            ]
          }
        : undefined)
    }
  }
}
