SystemJS.config({
  map: {
    'plugin-babel': 'npm:systemjs-plugin-babel@0.0.21'
  },
  meta: {
    '*.js': {
      'babelOptions': {}
    },
    '*.vue': {
      'loader': 'npm:systemjs-plugin-vue@1.2.0'
    }
  }
});
