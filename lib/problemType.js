'use strict';

const ERR_STATUS = 'status must be a valid HTTP Error Status Code';
const ERR_TYPEURL = 'type must be an absolute URI';

const absolute = require('./tools').absolute;
const constant = require('./tools').constant;
const status = Symbol('status');

const statusDef = {
  configurable: false,
  enumerable: true,
  get: () => this[status],
  set: (val) => {
    if (val === undefined || val === null) delete this[status];
    else {
      const valInt = parseInt(val, 10);

      if (isNaN(valInt) || valInt < 200 || valInt > 999) throw new TypeError(ERR_STATUS);

      this[status] = valInt;
    }
  },
};

function ProblemType(type, title, op) {
  const options = op || {};

  if (!(this instanceof ProblemType)) return new ProblemType(type, title);
  if (!absolute(type)) throw new TypeError(ERR_TYPEURL);
  if (title) constant(this, 'title', String(title));
  if (options.status !== undefined) this.status = options.status;

  constant(this, 'type', type);
  constant(this, 'instance', options.ins);
}

ProblemType.prototype = {
  toString: function () { // eslint-disable-line
    return `[${this.status}] ${this.title} > ${this.type}`;
  },
  valueOf: function () { // eslint-disable-line
    return this.type;
  },
};

Object.defineProperty(ProblemType.prototype, 'status', statusDef);

module.exports = ProblemType;
