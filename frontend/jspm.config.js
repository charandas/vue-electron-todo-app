SystemJS.config({
  nodeConfig: {
    'paths': {
      'npm:': 'jspm_packages/npm/',
      'github:': 'jspm_packages/github/',
      'gitlab:': 'jspm_packages/gitlab/',
      'techeast_menubar/': 'src/menubar/',
      'techeast/': 'src/'
    }
  },
  transpiler: 'plugin-babel',
  packages: {
    'techeast': {
      'main': 'techeast.js',
      'format': 'esm',
      'meta': {
        '*.js': {
          'loader': 'plugin-babel'
        },
        '*.vue': {
          'loader': 'systemjs-plugin-vue'
        }
      }
    },
    'github:charandas/vue-clock-picker@0.4.3': {
      'meta': {
        'vue': 'npm:vue@2.3.3'
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    'npm:@*/*.json',
    'npm:*.json',
    'github:*/*.json',
    'gitlab:*/*.json'
  ],
  map: {
    'domain': 'npm:jspm-nodelibs-domain@0.2.1',
    'module': 'npm:jspm-nodelibs-module@0.2.1',
    'popper.js': 'npm:popper.js@1.9.4',
    'tooltip.js': 'npm:tooltip.js@1.1.3',
    'tty': 'npm:jspm-nodelibs-tty@0.2.1',
    'uglify-to-browserify': 'npm:uglify-to-browserify@1.0.2',
    'child_process': 'npm:jspm-nodelibs-child_process@0.2.1',
    'punycode': 'npm:jspm-nodelibs-punycode@0.2.1',
    'systemjs-plugin-vue': 'npm:systemjs-plugin-vue@1.2.0',
    'mdi': 'npm:mdi@1.9.33',
    'assert': 'npm:jspm-nodelibs-assert@0.2.1',
    'axios': 'npm:axios@0.15.3',
    'bluebird': 'npm:bluebird@3.5.0',
    'buffer': 'npm:jspm-nodelibs-buffer@0.2.3',
    'constants': 'npm:jspm-nodelibs-constants@0.2.1',
    'crypto': 'npm:jspm-nodelibs-crypto@0.2.1',
    'css': 'github:systemjs/plugin-css@0.1.33',
    'events': 'npm:jspm-nodelibs-events@0.2.2',
    'fs': 'npm:jspm-nodelibs-fs@0.2.1',
    'http': 'npm:jspm-nodelibs-http@0.2.0',
    'https': 'npm:jspm-nodelibs-https@0.2.2',
    'json': 'github:systemjs/plugin-json@0.3.0',
    'lodash': 'npm:lodash@4.17.4',
    'os': 'npm:jspm-nodelibs-os@0.2.1',
    'path': 'npm:jspm-nodelibs-path@0.2.3',
    'process': 'npm:jspm-nodelibs-process@0.2.1',
    'stream': 'npm:jspm-nodelibs-stream@0.2.1',
    'string_decoder': 'npm:jspm-nodelibs-string_decoder@0.2.1',
    'text': 'github:systemjs/plugin-text@0.0.9',
    'url': 'npm:jspm-nodelibs-url@0.2.1',
    'util': 'npm:jspm-nodelibs-util@0.2.2',
    'v-tooltip': 'npm:v-tooltip@2.0.0-beta.4',
    'vm': 'npm:jspm-nodelibs-vm@0.2.1',
    'vtc': 'gitlab:mrman/systemjs-plugin-vue-template-compiler@2.2.1',
    'vue': 'npm:vue@2.3.3',
    'vue-button': 'github:charandas/vue-button@1.0.0',
    'vue-clock-picker': 'github:charandas/vue-clock-picker@0.4.4',
    'vue-formly': 'npm:vue-formly@2.3.5',
    'vue-formly-bootstrap': 'npm:vue-formly-bootstrap@2.2.5',
    'vue-hot-reload-api': 'npm:vue-hot-reload-api@2.1.0',
    'vue-longpress': 'npm:vue-longpress@1.0.1',
    'vue-router': 'npm:vue-router@2.5.3',
    'vue-spinner': 'npm:vue-spinner@1.0.2',
    'vuedraggable': 'npm:vuedraggable@2.11.0',
    'zlib': 'npm:jspm-nodelibs-zlib@0.2.3'
  },
  packages: {
    'gitlab:mrman/systemjs-plugin-vue-template-compiler@2.2.1': {
      'map': {
        'vue-template-compiler': 'npm:vue-template-compiler@2.3.3'
      }
    },
    'npm:axios@0.15.3': {
      'map': {
        'follow-redirects': 'npm:follow-redirects@1.0.0'
      }
    },
    'npm:follow-redirects@1.0.0': {
      'map': {
        'debug': 'npm:debug@2.6.6'
      }
    },
    'npm:jspm-nodelibs-zlib@0.2.3': {
      'map': {
        'browserify-zlib': 'npm:browserify-zlib@0.1.4'
      }
    },
    'npm:jspm-nodelibs-url@0.2.1': {
      'map': {
        'url': 'npm:url@0.11.0'
      }
    },
    'npm:jspm-nodelibs-http@0.2.0': {
      'map': {
        'http-browserify': 'npm:stream-http@2.7.1'
      }
    },
    'npm:jspm-nodelibs-stream@0.2.1': {
      'map': {
        'stream-browserify': 'npm:stream-browserify@2.0.1'
      }
    },
    'npm:url@0.11.0': {
      'map': {
        'querystring': 'npm:querystring@0.2.0',
        'punycode': 'npm:punycode@1.3.2'
      }
    },
    'npm:browserify-zlib@0.1.4': {
      'map': {
        'readable-stream': 'npm:readable-stream@2.2.9',
        'pako': 'npm:pako@0.2.9'
      }
    },
    'npm:stream-browserify@2.0.1': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'readable-stream': 'npm:readable-stream@2.2.9'
      }
    },
    'npm:jspm-nodelibs-os@0.2.1': {
      'map': {
        'os-browserify': 'npm:os-browserify@0.2.1'
      }
    },
    'npm:jspm-nodelibs-crypto@0.2.1': {
      'map': {
        'crypto-browserify': 'npm:crypto-browserify@3.11.0'
      }
    },
    'npm:crypto-browserify@3.11.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'browserify-cipher': 'npm:browserify-cipher@1.0.0',
        'browserify-sign': 'npm:browserify-sign@4.0.4',
        'public-encrypt': 'npm:public-encrypt@4.0.0',
        'create-hmac': 'npm:create-hmac@1.1.6',
        'create-ecdh': 'npm:create-ecdh@4.0.0',
        'randombytes': 'npm:randombytes@2.0.3',
        'create-hash': 'npm:create-hash@1.1.3',
        'pbkdf2': 'npm:pbkdf2@3.0.12',
        'diffie-hellman': 'npm:diffie-hellman@5.0.2'
      }
    },
    'npm:public-encrypt@4.0.0': {
      'map': {
        'randombytes': 'npm:randombytes@2.0.3',
        'create-hash': 'npm:create-hash@1.1.3',
        'bn.js': 'npm:bn.js@4.11.6',
        'browserify-rsa': 'npm:browserify-rsa@4.0.1',
        'parse-asn1': 'npm:parse-asn1@5.1.0'
      }
    },
    'npm:browserify-sign@4.0.4': {
      'map': {
        'create-hmac': 'npm:create-hmac@1.1.6',
        'inherits': 'npm:inherits@2.0.3',
        'create-hash': 'npm:create-hash@1.1.3',
        'bn.js': 'npm:bn.js@4.11.6',
        'browserify-rsa': 'npm:browserify-rsa@4.0.1',
        'parse-asn1': 'npm:parse-asn1@5.1.0',
        'elliptic': 'npm:elliptic@6.4.0'
      }
    },
    'npm:diffie-hellman@5.0.2': {
      'map': {
        'randombytes': 'npm:randombytes@2.0.3',
        'bn.js': 'npm:bn.js@4.11.6',
        'miller-rabin': 'npm:miller-rabin@4.0.0'
      }
    },
    'npm:browserify-cipher@1.0.0': {
      'map': {
        'browserify-aes': 'npm:browserify-aes@1.0.6',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'browserify-des': 'npm:browserify-des@1.0.0'
      }
    },
    'npm:create-ecdh@4.0.0': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'elliptic': 'npm:elliptic@6.4.0'
      }
    },
    'npm:browserify-rsa@4.0.1': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'randombytes': 'npm:randombytes@2.0.3'
      }
    },
    'npm:browserify-aes@1.0.6': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.3',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'buffer-xor': 'npm:buffer-xor@1.0.3'
      }
    },
    'npm:evp_bytestokey@1.0.0': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.3'
      }
    },
    'npm:cipher-base@1.0.3': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:elliptic@6.4.0': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'inherits': 'npm:inherits@2.0.3',
        'hmac-drbg': 'npm:hmac-drbg@1.0.1',
        'brorand': 'npm:brorand@1.1.0',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0',
        'minimalistic-crypto-utils': 'npm:minimalistic-crypto-utils@1.0.1',
        'hash.js': 'npm:hash.js@1.0.3'
      }
    },
    'npm:miller-rabin@4.0.0': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'brorand': 'npm:brorand@1.1.0'
      }
    },
    'npm:sha.js@2.4.8': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:parse-asn1@5.1.0': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.3',
        'pbkdf2': 'npm:pbkdf2@3.0.12',
        'browserify-aes': 'npm:browserify-aes@1.0.6',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'asn1.js': 'npm:asn1.js@4.9.1'
      }
    },
    'npm:browserify-des@1.0.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'des.js': 'npm:des.js@1.0.0'
      }
    },
    'npm:jspm-nodelibs-string_decoder@0.2.1': {
      'map': {
        'string_decoder': 'npm:string_decoder@0.10.31'
      }
    },
    'npm:hash.js@1.0.3': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:des.js@1.0.0': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0'
      }
    },
    'npm:asn1.js@4.9.1': {
      'map': {
        'bn.js': 'npm:bn.js@4.11.6',
        'inherits': 'npm:inherits@2.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0'
      }
    },
    'npm:babel-runtime@6.23.0': {
      'map': {
        'regenerator-runtime': 'npm:regenerator-runtime@0.10.5',
        'core-js': 'npm:core-js@2.4.1'
      }
    },
    'npm:jspm-nodelibs-buffer@0.2.3': {
      'map': {
        'buffer': 'npm:buffer@5.0.6'
      }
    },
    'npm:buffer@5.0.6': {
      'map': {
        'ieee754': 'npm:ieee754@1.1.8',
        'base64-js': 'npm:base64-js@1.2.0'
      }
    },
    'npm:stream-http@2.7.1': {
      'map': {
        'builtin-status-codes': 'npm:builtin-status-codes@3.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'readable-stream': 'npm:readable-stream@2.2.9',
        'to-arraybuffer': 'npm:to-arraybuffer@1.0.1',
        'xtend': 'npm:xtend@4.0.1'
      }
    },
    'npm:readable-stream@2.2.9': {
      'map': {
        'string_decoder': 'npm:string_decoder@1.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'core-util-is': 'npm:core-util-is@1.0.2',
        'isarray': 'npm:isarray@1.0.0',
        'process-nextick-args': 'npm:process-nextick-args@1.0.7',
        'util-deprecate': 'npm:util-deprecate@1.0.2',
        'buffer-shims': 'npm:buffer-shims@1.0.0'
      }
    },
    'npm:debug@2.6.6': {
      'map': {
        'ms': 'npm:ms@0.7.3'
      }
    },
    'npm:string_decoder@1.0.0': {
      'map': {
        'buffer-shims': 'npm:buffer-shims@1.0.0'
      }
    },
    'npm:vue-template-compiler@2.3.3': {
      'map': {
        'de-indent': 'npm:de-indent@1.0.2',
        'he': 'npm:he@1.1.1'
      }
    },
    'npm:hmac-drbg@1.0.1': {
      'map': {
        'hash.js': 'npm:hash.js@1.0.3',
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0',
        'minimalistic-crypto-utils': 'npm:minimalistic-crypto-utils@1.0.1'
      }
    },
    'npm:systemjs-plugin-vue@1.2.0': {
      'map': {
        'cssnano': 'npm:cssnano@3.10.0',
        'lru-cache': 'npm:lru-cache@4.0.2',
        'postcss-selector-parser': 'npm:postcss-selector-parser@2.2.3',
        'falafel': 'npm:falafel@1.2.0',
        'postcss': 'npm:postcss@5.2.17',
        'vue-template-compiler': 'npm:vue-template-compiler@2.3.3'
      }
    },
    'npm:cssnano@3.10.0': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'defined': 'npm:defined@1.0.0',
        'has': 'npm:has@1.0.1',
        'decamelize': 'npm:decamelize@1.2.0',
        'postcss-reduce-transforms': 'npm:postcss-reduce-transforms@1.0.4',
        'postcss-discard-overridden': 'npm:postcss-discard-overridden@0.1.1',
        'postcss-minify-font-values': 'npm:postcss-minify-font-values@1.0.5',
        'postcss-reduce-initial': 'npm:postcss-reduce-initial@1.0.1',
        'postcss-discard-empty': 'npm:postcss-discard-empty@2.1.0',
        'postcss-normalize-charset': 'npm:postcss-normalize-charset@1.1.1',
        'postcss-calc': 'npm:postcss-calc@5.3.1',
        'postcss-discard-duplicates': 'npm:postcss-discard-duplicates@2.1.0',
        'object-assign': 'npm:object-assign@4.1.1',
        'postcss-discard-unused': 'npm:postcss-discard-unused@2.2.3',
        'postcss-merge-idents': 'npm:postcss-merge-idents@2.1.7',
        'postcss-discard-comments': 'npm:postcss-discard-comments@2.0.4',
        'postcss-filter-plugins': 'npm:postcss-filter-plugins@2.0.2',
        'postcss-merge-longhand': 'npm:postcss-merge-longhand@2.0.2',
        'postcss-minify-gradients': 'npm:postcss-minify-gradients@1.0.5',
        'postcss-colormin': 'npm:postcss-colormin@2.2.2',
        'postcss-unique-selectors': 'npm:postcss-unique-selectors@2.0.2',
        'postcss-merge-rules': 'npm:postcss-merge-rules@2.1.2',
        'postcss-normalize-url': 'npm:postcss-normalize-url@3.0.8',
        'postcss-zindex': 'npm:postcss-zindex@2.2.0',
        'postcss-ordered-values': 'npm:postcss-ordered-values@2.2.3',
        'postcss-svgo': 'npm:postcss-svgo@2.1.6',
        'postcss-convert-values': 'npm:postcss-convert-values@2.6.1',
        'postcss-minify-params': 'npm:postcss-minify-params@1.2.2',
        'postcss-reduce-idents': 'npm:postcss-reduce-idents@2.4.0',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'postcss-minify-selectors': 'npm:postcss-minify-selectors@2.1.1',
        'autoprefixer': 'npm:autoprefixer@6.7.7'
      }
    },
    'npm:postcss-reduce-transforms@1.0.4': {
      'map': {
        'has': 'npm:has@1.0.1',
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0'
      }
    },
    'npm:postcss-discard-overridden@0.1.1': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-minify-font-values@1.0.5': {
      'map': {
        'object-assign': 'npm:object-assign@4.1.1',
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0'
      }
    },
    'npm:postcss-discard-empty@2.1.0': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-reduce-initial@1.0.1': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-normalize-charset@1.1.1': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-merge-idents@2.1.7': {
      'map': {
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'has': 'npm:has@1.0.1',
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-minify-gradients@1.0.5': {
      'map': {
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-colormin@2.2.2': {
      'map': {
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'postcss': 'npm:postcss@5.2.17',
        'colormin': 'npm:colormin@1.1.2'
      }
    },
    'npm:falafel@1.2.0': {
      'map': {
        'isarray': 'npm:isarray@0.0.1',
        'foreach': 'npm:foreach@2.0.5',
        'object-keys': 'npm:object-keys@1.0.11',
        'acorn': 'npm:acorn@1.2.2'
      }
    },
    'npm:postcss-discard-duplicates@2.1.0': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-calc@5.3.1': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-message-helpers': 'npm:postcss-message-helpers@2.0.0',
        'reduce-css-calc': 'npm:reduce-css-calc@1.3.0'
      }
    },
    'npm:postcss-discard-unused@2.2.3': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'uniqs': 'npm:uniqs@2.0.0'
      }
    },
    'npm:postcss-discard-comments@2.0.4': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-merge-longhand@2.0.2': {
      'map': {
        'postcss': 'npm:postcss@5.2.17'
      }
    },
    'npm:postcss-filter-plugins@2.0.2': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'uniqid': 'npm:uniqid@4.1.1'
      }
    },
    'npm:lru-cache@4.0.2': {
      'map': {
        'pseudomap': 'npm:pseudomap@1.0.2',
        'yallist': 'npm:yallist@2.1.2'
      }
    },
    'npm:postcss-unique-selectors@2.0.2': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'uniqs': 'npm:uniqs@2.0.0',
        'alphanum-sort': 'npm:alphanum-sort@1.0.2'
      }
    },
    'npm:postcss-normalize-url@3.0.8': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'is-absolute-url': 'npm:is-absolute-url@2.1.0',
        'normalize-url': 'npm:normalize-url@1.9.1'
      }
    },
    'npm:postcss-merge-rules@2.1.2': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-selector-parser': 'npm:postcss-selector-parser@2.2.3',
        'vendors': 'npm:vendors@1.0.1',
        'caniuse-api': 'npm:caniuse-api@1.6.1',
        'browserslist': 'npm:browserslist@1.7.7'
      }
    },
    'npm:postcss-zindex@2.2.0': {
      'map': {
        'has': 'npm:has@1.0.1',
        'postcss': 'npm:postcss@5.2.17',
        'uniqs': 'npm:uniqs@2.0.0'
      }
    },
    'npm:postcss-ordered-values@2.2.3': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0'
      }
    },
    'npm:postcss-selector-parser@2.2.3': {
      'map': {
        'flatten': 'npm:flatten@1.0.2',
        'indexes-of': 'npm:indexes-of@1.0.1',
        'uniq': 'npm:uniq@1.0.1'
      }
    },
    'npm:postcss-convert-values@2.6.1': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0'
      }
    },
    'npm:postcss-svgo@2.1.6': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'is-svg': 'npm:is-svg@2.1.0',
        'svgo': 'npm:svgo@0.7.2'
      }
    },
    'npm:postcss-minify-params@1.2.2': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'uniqs': 'npm:uniqs@2.0.0',
        'alphanum-sort': 'npm:alphanum-sort@1.0.2'
      }
    },
    'npm:postcss-reduce-idents@2.4.0': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0'
      }
    },
    'npm:postcss-minify-selectors@2.1.1': {
      'map': {
        'has': 'npm:has@1.0.1',
        'postcss': 'npm:postcss@5.2.17',
        'postcss-selector-parser': 'npm:postcss-selector-parser@2.2.3',
        'alphanum-sort': 'npm:alphanum-sort@1.0.2'
      }
    },
    'npm:postcss@5.2.17': {
      'map': {
        'js-base64': 'npm:js-base64@2.1.9',
        'supports-color': 'npm:supports-color@3.2.3',
        'chalk': 'npm:chalk@1.1.3',
        'source-map': 'npm:source-map@0.5.6'
      }
    },
    'npm:chalk@1.1.3': {
      'map': {
        'supports-color': 'npm:supports-color@2.0.0',
        'has-ansi': 'npm:has-ansi@2.0.0',
        'ansi-styles': 'npm:ansi-styles@2.2.1',
        'strip-ansi': 'npm:strip-ansi@3.0.1',
        'escape-string-regexp': 'npm:escape-string-regexp@1.0.5'
      }
    },
    'npm:autoprefixer@6.7.7': {
      'map': {
        'postcss': 'npm:postcss@5.2.17',
        'postcss-value-parser': 'npm:postcss-value-parser@3.3.0',
        'browserslist': 'npm:browserslist@1.7.7',
        'num2fraction': 'npm:num2fraction@1.2.2',
        'normalize-range': 'npm:normalize-range@0.1.2',
        'caniuse-db': 'npm:caniuse-db@1.0.30000670'
      }
    },
    'npm:has@1.0.1': {
      'map': {
        'function-bind': 'npm:function-bind@1.1.0'
      }
    },
    'npm:colormin@1.1.2': {
      'map': {
        'has': 'npm:has@1.0.1',
        'css-color-names': 'npm:css-color-names@0.0.4',
        'color': 'npm:color@0.11.4'
      }
    },
    'npm:caniuse-api@1.6.1': {
      'map': {
        'browserslist': 'npm:browserslist@1.7.7',
        'lodash.memoize': 'npm:lodash.memoize@4.1.2',
        'lodash.uniq': 'npm:lodash.uniq@4.5.0',
        'caniuse-db': 'npm:caniuse-db@1.0.30000670'
      }
    },
    'npm:normalize-url@1.9.1': {
      'map': {
        'object-assign': 'npm:object-assign@4.1.1',
        'prepend-http': 'npm:prepend-http@1.0.4',
        'sort-keys': 'npm:sort-keys@1.1.2',
        'query-string': 'npm:query-string@4.3.4'
      }
    },
    'npm:supports-color@3.2.3': {
      'map': {
        'has-flag': 'npm:has-flag@1.0.0'
      }
    },
    'npm:uniqid@4.1.1': {
      'map': {
        'macaddress': 'npm:macaddress@0.2.8'
      }
    },
    'npm:reduce-css-calc@1.3.0': {
      'map': {
        'reduce-function-call': 'npm:reduce-function-call@1.0.2',
        'math-expression-evaluator': 'npm:math-expression-evaluator@1.2.17',
        'balanced-match': 'npm:balanced-match@0.4.2'
      }
    },
    'npm:reduce-function-call@1.0.2': {
      'map': {
        'balanced-match': 'npm:balanced-match@0.4.2'
      }
    },
    'npm:is-svg@2.1.0': {
      'map': {
        'html-comment-regex': 'npm:html-comment-regex@1.1.1'
      }
    },
    'npm:browserslist@1.7.7': {
      'map': {
        'electron-to-chromium': 'npm:electron-to-chromium@1.3.10',
        'caniuse-db': 'npm:caniuse-db@1.0.30000670'
      }
    },
    'npm:query-string@4.3.4': {
      'map': {
        'object-assign': 'npm:object-assign@4.1.1',
        'strict-uri-encode': 'npm:strict-uri-encode@1.1.0'
      }
    },
    'npm:has-ansi@2.0.0': {
      'map': {
        'ansi-regex': 'npm:ansi-regex@2.1.1'
      }
    },
    'npm:strip-ansi@3.0.1': {
      'map': {
        'ansi-regex': 'npm:ansi-regex@2.1.1'
      }
    },
    'npm:svgo@0.7.2': {
      'map': {
        'mkdirp': 'npm:mkdirp@0.5.1',
        'colors': 'npm:colors@1.1.2',
        'whet.extend': 'npm:whet.extend@0.9.9',
        'sax': 'npm:sax@1.2.2',
        'coa': 'npm:coa@1.0.1',
        'js-yaml': 'npm:js-yaml@3.7.0',
        'csso': 'npm:csso@2.3.2'
      }
    },
    'npm:color@0.11.4': {
      'map': {
        'color-string': 'npm:color-string@0.3.0',
        'color-convert': 'npm:color-convert@1.9.0',
        'clone': 'npm:clone@1.0.2'
      }
    },
    'npm:csso@2.3.2': {
      'map': {
        'source-map': 'npm:source-map@0.5.6',
        'clap': 'npm:clap@1.1.3'
      }
    },
    'npm:sort-keys@1.1.2': {
      'map': {
        'is-plain-obj': 'npm:is-plain-obj@1.1.0'
      }
    },
    'npm:mkdirp@0.5.1': {
      'map': {
        'minimist': 'npm:minimist@0.0.8'
      }
    },
    'npm:js-yaml@3.7.0': {
      'map': {
        'argparse': 'npm:argparse@1.0.9',
        'esprima': 'npm:esprima@2.7.3'
      }
    },
    'npm:clap@1.1.3': {
      'map': {
        'chalk': 'npm:chalk@1.1.3'
      }
    },
    'npm:coa@1.0.1': {
      'map': {
        'q': 'npm:q@1.5.0'
      }
    },
    'npm:color-string@0.3.0': {
      'map': {
        'color-name': 'npm:color-name@1.1.2'
      }
    },
    'npm:color-convert@1.9.0': {
      'map': {
        'color-name': 'npm:color-name@1.1.2'
      }
    },
    'npm:argparse@1.0.9': {
      'map': {
        'sprintf-js': 'npm:sprintf-js@1.0.3'
      }
    },
    'npm:jspm-nodelibs-punycode@0.2.1': {
      'map': {
        'punycode': 'npm:punycode@1.4.1'
      }
    },
    'npm:create-hash@1.1.3': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'ripemd160': 'npm:ripemd160@2.0.1',
        'sha.js': 'npm:sha.js@2.4.8'
      }
    },
    'npm:create-hmac@1.1.6': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.3',
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'ripemd160': 'npm:ripemd160@2.0.1',
        'sha.js': 'npm:sha.js@2.4.8',
        'safe-buffer': 'npm:safe-buffer@5.0.1'
      }
    },
    'npm:pbkdf2@3.0.12': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.3',
        'create-hmac': 'npm:create-hmac@1.1.6',
        'ripemd160': 'npm:ripemd160@2.0.1',
        'sha.js': 'npm:sha.js@2.4.8',
        'safe-buffer': 'npm:safe-buffer@5.0.1'
      }
    },
    'npm:ripemd160@2.0.1': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'hash-base': 'npm:hash-base@2.0.2'
      }
    },
    'npm:hash-base@2.0.2': {
      'map': {
        'inherits': 'npm:inherits@2.0.3'
      }
    },
    'npm:jspm-nodelibs-domain@0.2.1': {
      'map': {
        'domain-browser': 'npm:domain-browser@1.1.7'
      }
    },
    'npm:vue-formly@2.3.5': {
      'map': {
        'babel-runtime': 'npm:babel-runtime@6.23.0'
      }
    },
    'npm:v-tooltip@2.0.0-beta.4': {
      'map': {
        'tooltip.js': 'npm:tooltip.js@1.1.3'
      }
    },
    'npm:tooltip.js@1.1.3': {
      'map': {
        'popper.js': 'npm:popper.js@1.9.4'
      }
    },
    'npm:vue-longpress@1.0.1': {
      'map': {
        'vue': 'npm:vue@2.3.3'
      }
    },
    'npm:vuedraggable@2.11.0': {
      'map': {
        'sortablejs': 'npm:sortablejs@1.5.1'
      }
    }
  }
});
