SystemJS.config({
  map: {
    'plugin-babel': 'npm:systemjs-plugin-babel@0.0.21'
  },
  meta: {
    '*.js': {
      'babelOptions': {}
    }
  }
});
