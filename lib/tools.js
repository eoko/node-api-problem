'use strict';

const url = require('url');

function absolute(uri) {
  let res = url.parse(uri);
  return res.protocol !== undefined && res.protocol !== null;
}

function constant(target, name, value, hidden) {
  let def = {
    configurable: false,
    enumerable: value !== undefined && !hidden,
    value: value
  };
  Object.defineProperty(target, name, def);
}

module.exports = {
  absolute: absolute,
  constant: constant
};
