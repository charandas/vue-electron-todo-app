SystemJS.config({
  nodeConfig: {
    'paths': {
      'npm:': 'jspm_packages/npm/',
      'github:': 'jspm_packages/github/',
      'gitlab:': 'jspm_packages/gitlab/',
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
        }
      }
    }
  },
  map: {
    'vtc': 'gitlab:mrman/systemjs-plugin-vue-template-compiler@2.2.1'
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
    'mdi': 'npm:mdi@1.9.33',
    'mrman/systemjs-plugin-vue-template-compiler': 'gitlab:mrman/systemjs-plugin-vue-template-compiler@2.2.1',
    'assert': 'npm:jspm-nodelibs-assert@0.2.1',
    'axios': 'npm:axios@0.15.3',
    'bluebird': 'npm:bluebird@3.5.0',
    'buffer': 'npm:jspm-nodelibs-buffer@0.2.2',
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
    'vm': 'npm:jspm-nodelibs-vm@0.2.1',
    'vue': 'npm:vue@2.2.6',
    'vue-router': 'npm:vue-router@2.5.2',
    'zlib': 'npm:jspm-nodelibs-zlib@0.2.3'
  },
  packages: {
    'gitlab:mrman/systemjs-plugin-vue-template-compiler@2.2.1': {
      'map': {
        'vue-template-compiler': 'npm:vue-template-compiler@2.2.6'
      }
    },
    'npm:vue-template-compiler@2.2.6': {
      'map': {
        'he': 'npm:he@1.1.1',
        'de-indent': 'npm:de-indent@1.0.2'
      }
    },
    'npm:axios@0.15.3': {
      'map': {
        'follow-redirects': 'npm:follow-redirects@1.0.0'
      }
    },
    'npm:follow-redirects@1.0.0': {
      'map': {
        'debug': 'npm:debug@2.6.3'
      }
    },
    'npm:jspm-nodelibs-zlib@0.2.3': {
      'map': {
        'browserify-zlib': 'npm:browserify-zlib@0.1.4'
      }
    },
    'npm:jspm-nodelibs-buffer@0.2.2': {
      'map': {
        'buffer': 'npm:buffer@4.9.1'
      }
    },
    'npm:jspm-nodelibs-url@0.2.1': {
      'map': {
        'url': 'npm:url@0.11.0'
      }
    },
    'npm:jspm-nodelibs-http@0.2.0': {
      'map': {
        'http-browserify': 'npm:stream-http@2.7.0'
      }
    },
    'npm:buffer@4.9.1': {
      'map': {
        'ieee754': 'npm:ieee754@1.1.8',
        'isarray': 'npm:isarray@1.0.0',
        'base64-js': 'npm:base64-js@1.2.0'
      }
    },
    'npm:debug@2.6.3': {
      'map': {
        'ms': 'npm:ms@0.7.2'
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
        'readable-stream': 'npm:readable-stream@2.2.6',
        'pako': 'npm:pako@0.2.9'
      }
    },
    'npm:stream-http@2.7.0': {
      'map': {
        'readable-stream': 'npm:readable-stream@2.2.6',
        'builtin-status-codes': 'npm:builtin-status-codes@3.0.0',
        'to-arraybuffer': 'npm:to-arraybuffer@1.0.1',
        'inherits': 'npm:inherits@2.0.3',
        'xtend': 'npm:xtend@4.0.1'
      }
    },
    'npm:stream-browserify@2.0.1': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'readable-stream': 'npm:readable-stream@2.2.6'
      }
    },
    'npm:readable-stream@2.2.6': {
      'map': {
        'isarray': 'npm:isarray@1.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'process-nextick-args': 'npm:process-nextick-args@1.0.7',
        'core-util-is': 'npm:core-util-is@1.0.2',
        'util-deprecate': 'npm:util-deprecate@1.0.2',
        'buffer-shims': 'npm:buffer-shims@1.0.0',
        'string_decoder': 'npm:string_decoder@0.10.31'
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
        'create-hmac': 'npm:create-hmac@1.1.4',
        'create-ecdh': 'npm:create-ecdh@4.0.0',
        'randombytes': 'npm:randombytes@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2',
        'pbkdf2': 'npm:pbkdf2@3.0.9',
        'diffie-hellman': 'npm:diffie-hellman@5.0.2'
      }
    },
    'npm:public-encrypt@4.0.0': {
      'map': {
        'randombytes': 'npm:randombytes@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2',
        'bn.js': 'npm:bn.js@4.11.6',
        'browserify-rsa': 'npm:browserify-rsa@4.0.1',
        'parse-asn1': 'npm:parse-asn1@5.1.0'
      }
    },
    'npm:create-hmac@1.1.4': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2'
      }
    },
    'npm:browserify-sign@4.0.4': {
      'map': {
        'create-hmac': 'npm:create-hmac@1.1.4',
        'inherits': 'npm:inherits@2.0.3',
        'create-hash': 'npm:create-hash@1.1.2',
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
    'npm:pbkdf2@3.0.9': {
      'map': {
        'create-hmac': 'npm:create-hmac@1.1.4'
      }
    },
    'npm:create-hash@1.1.2': {
      'map': {
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'ripemd160': 'npm:ripemd160@1.0.1',
        'sha.js': 'npm:sha.js@2.4.8'
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
        'create-hash': 'npm:create-hash@1.1.2',
        'evp_bytestokey': 'npm:evp_bytestokey@1.0.0',
        'inherits': 'npm:inherits@2.0.3',
        'cipher-base': 'npm:cipher-base@1.0.3',
        'buffer-xor': 'npm:buffer-xor@1.0.3'
      }
    },
    'npm:evp_bytestokey@1.0.0': {
      'map': {
        'create-hash': 'npm:create-hash@1.1.2'
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
        'hmac-drbg': 'npm:hmac-drbg@1.0.0',
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
        'create-hash': 'npm:create-hash@1.1.2',
        'pbkdf2': 'npm:pbkdf2@3.0.9',
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
    'npm:hmac-drbg@1.0.0': {
      'map': {
        'minimalistic-assert': 'npm:minimalistic-assert@1.0.0',
        'minimalistic-crypto-utils': 'npm:minimalistic-crypto-utils@1.0.1',
        'hash.js': 'npm:hash.js@1.0.3'
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
    }
  }
});
