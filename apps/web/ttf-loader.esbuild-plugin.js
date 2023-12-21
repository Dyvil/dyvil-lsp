module.exports = {
  name: 'ttf-loader',
  setup(build) {
    (build.initialOptions.loader ??= {})['.ttf'] = 'dataurl';
  },
};
