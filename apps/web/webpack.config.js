const {merge} = require('webpack-merge');
const {resolve} = require('path');
const {ProvidePlugin} = require('webpack');

module.exports = (config, context) => {
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        path: resolve(__dirname, '../../node_modules/path-browserify'),
      },
    },
    plugins: [
      new ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  });
};
