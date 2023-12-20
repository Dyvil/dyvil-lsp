const {merge} = require('webpack-merge');
const {DefinePlugin} = require('webpack');

module.exports = (config) => {
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader?{"url":false}'],
        },
        {
          test: /\.(ttf|mp3|wasm)$/,
          type: 'asset/resource'
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
    plugins: [
      new DefinePlugin({
        'process.env': '{}',
      }),
    ],
  });
};
