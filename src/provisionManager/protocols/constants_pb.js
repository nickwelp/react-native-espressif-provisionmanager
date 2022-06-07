// source: constants.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.Status', null, global);
/**
 * @enum {number}
 */
proto.Status = {
  SUCCESS: 0,
  INVALIDSECSCHEME: 1,
  INVALIDPROTO: 2,
  TOOMANYSESSIONS: 3,
  INVALIDARGUMENT: 4,
  INTERNALERROR: 5,
  CRYPTOERROR: 6,
  INVALIDSESSION: 7
};

goog.object.extend(exports, proto);
