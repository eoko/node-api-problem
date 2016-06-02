'use strict';

const url = require('url');

function absolute(uri) {
  const res = url.parse(uri);
  return res.protocol !== undefined && res.protocol !== null;
}

function constant(target, name, value, hidden) {
  const def = {
    configurable: false,
    enumerable: value !== undefined && !hidden,
    value,
  };
  Object.defineProperty(target, name, def);
}

module.exports = {
  absolute,
  constant,
};
