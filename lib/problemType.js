'use strict';

const _ = require('lodash');

const ERR_STATUS = 'status must be a valid HTTP Error Status Code';

const absolute = require('./tools').absolute;
const constant = require('./tools').constant;
const _status = Symbol('status');

var statusDef = {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_status];
  },
  set: function (val) {
    if (val === undefined || val === null) delete this[_status];
    else {
      val = parseInt(val);

      if (isNaN(val) || val < 200 || val > 999)  throw new TypeError(ERR_STATUS);

      this[_status] = val;
    }
  }
};

function ProblemType(type, title, options) {
  options = options || {};

  if (!(this instanceof ProblemType)) return new ProblemType(type, title);
  if (!absolute(type))                throw new TypeError(ERR_TYPEURL);
  if (title)                          constant(this, 'title', String(title));
  if (options.status !== undefined)   this.status = options.status;

  constant(this, 'type', type);
  constant(this, 'instance', options.ins);
}

ProblemType.prototype = {
  toString: function () {
    return `[${this.status}] ${this.title} > ${this.type}`;
  },
  valueOf: function () {
    return this.type;
  }
};

Object.defineProperty(ProblemType.prototype, 'status', statusDef);

module.exports = ProblemType;