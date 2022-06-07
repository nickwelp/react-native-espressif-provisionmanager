/* eslint-disable no-undef */
// if (typeof __dirname === 'undefined') global.__dirname = '/'
// if (typeof __filename === 'undefined') global.__filename = ''
// if (typeof process === 'undefined') {
//   global.process = require('process')
// } else {
//   const bProcess = require('process')
//   for (var p in bProcess) {
//     if (!(p in process)) {
//       process[p] = bProcess[p]
//     }
//   }
// }

// process.browser = false
// if (typeof Buffer === 'undefined') global.Buffer = require('buffer/').Buffer

// // global.location = global.location || { port: 80 }
// const isDev = typeof __DEV__ === 'boolean' && __DEV__
// process.env['NODE_ENV'] = isDev ? 'development' : 'production'
// if (typeof localStorage !== 'undefined') {
//   localStorage.debug = isDev ? '*' : ''
// }

// // If using the crypto shim, uncomment the following line to ensure
// // crypto is loaded first, so it can populate global.crypto
// require('crypto')



global.self = global;
if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (const p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer');

process.browser = false;
if (typeof Buffer === 'undefined') global.Buffer = require('buffer/').Buffer;

// global.location = global.location || { port: 80 }
const isDev = typeof __DEV__ === 'boolean' && __DEV__;
process.env.NODE_ENV = isDev ? 'development' : 'production';
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : '';
}

// If using the crypto shim, uncomment the following line to ensure
// crypto is loaded first, so it can populate global.crypto
require('crypto');

// navigator.geolocation = require('react-native-geolocation-service');

// const RNFetchBlob = require('react-native-blob-util').default;

// // eslint-disable-next-line prefer-destructuring
// const Fetch = RNFetchBlob.polyfill.Fetch;
// // replace built-in fetch
// global.fetch = new Fetch({
//   // enable this option so that the response data conversion handled automatically
//   auto: true,
//   // when receiving response data, the module will match its Content-Type header
//   // with strings in this array. If it contains any one of string in this array,
//   // the response body will be considered as binary data and the data will be stored
//   // in file system instead of in memory.
//   // By default, it only store response data to file system when Content-Type
//   // contains string `application/octet`.
//   binaryContentTypes: [
//     'image/',
//     'video/',
//     'audio/',
//     'foo/',
//   ]
// }).build();
