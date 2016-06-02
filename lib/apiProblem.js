'use strict';

const util = require('util');
const http = require('http-status');
const prefix = 'http://www.iana.org/assignments/http-status-codes#';

const ProblemType = require('./problemType');
const constant = require('./tools').constant;

const ERR_STATUS = 'status must be a valid HTTP Error Status Code';
const ERR_TYPE = 'type must be a string or Problem.Type';
const ERR_PROBTYPE = 'Not a valid problem type';

const detail = Symbol('detail');
const instance = Symbol('instance');

const registeredTypes = {};

function lookupProblemType(type) {
  return registeredTypes[type];
}

function forCode(code) {
  return lookupProblemType(prefix + code);
}

function toProblemType(type) {
  if (type instanceof ProblemType) {
    return type;
  } else if (typeof type === 'string') {
    return lookupProblemType(type) || new ProblemType(type);
  }
  throw new TypeError(ERR_TYPE);
}

function ApiProblem(type, op) {
  if (!(this instanceof ApiProblem)) return new ApiProblem(type, op);

  const options = op || {};
  const ptype = toProblemType(type) || ApiProblem.BLANK;

  Error.captureStackTrace(this, this.constructor);

  constant(this, 'name', 'HTTP-Problem', true);
  constant(this, 'message', ptype.toString(), true);
  constant(this, 'type', ptype.type);
  constant(this, 'title', options.title || ptype.title);

  if (options.status !== undefined && options.status !== null) {
    options.status = parseInt(options.status, 10);

    if (isNaN(options.status)
      || options.status < 200
      || options.status > 999
    ) {
      throw new TypeError(ERR_STATUS);
    }
  }

  for (const key in options) {
    if (key === 'status') {
      this.status = options.status;
    } else if (key === 'detail') {
      this.detail = options.detail;
    } else if (key === 'instance') {
      this.instance = options.instance;
    } else if (key === 'type' || key === 'title') {
      continue;
    } else {
      constant(this, key, options[key]);
    }
  }

  if (!this.status && ptype.status) this.status = ptype.status;
}

function create() {
  const func = function CustomProblem(type, options) {
    if (!(this instanceof CustomProblem)) return new CustomProblem(type, options);
    ApiProblem.call(this, type, options);
  };
  util.inherits(func, ApiProblem);
  return func;
}

function registerProblemType(type, title) {
  if (type instanceof ProblemType) {
    if (registeredTypes[type.type]) return false;
    constant(registeredTypes, type.type, type);
  } else if (typeof type === 'string') {
    if (registeredTypes[type]) return false;
    constant(registeredTypes, type, new ProblemType(type, title));
  } else {
    throw new TypeError(ERR_PROBTYPE);
  }
  return true;
}

ApiProblem.prototype.toJSON = function toJSON() {
  const obj = {};
  for (const key in this) {
    if ({}.hasOwnProperty.call(this, key)) {
      obj[key] = this[key];
    }
  }
  return obj;
};

ApiProblem.prototype.constant = function defConstant(name, value) {
  constant(this, name, value);
  return this;
};

Object.defineProperty(ApiProblem.prototype, 'detail', {
  configurable: false,
  enumerable: true,
  get: () => this[detail],
  set: (val) => {
    if (val === undefined || val === null) {
      delete this[detail];
    } else {
      this[detail] = String(val);
    }
  },
});

Object.defineProperty(ApiProblem.prototype, 'instance', {
  configurable: false,
  enumerable: true,
  get: () => this[instance],
  set: (val) => {
    if (val === undefined || val === null) {
      delete this[instance];
    } else {
      this[instance] = String(val);
    }
  },
});

util.inherits(ApiProblem, Error);

constant(ApiProblem, 'create', create);
constant(ApiProblem, 'registerProblemType', registerProblemType);
constant(ApiProblem, 'lookupProblemType', lookupProblemType);
constant(ApiProblem, 'Blank', new ApiProblem('about:blank', ''));
constant(ApiProblem, 'forStatus', forCode);

ApiProblem.prototype.toString = function () {
  return `${this.name}: [${this.status}] ${this.title} > ${this.type}`;
};

for (const key in http) {
  if (isNaN(key)) {
    const code = http[key];
    if (code >= 200) {
      const type = new ProblemType(prefix + code, http[code], { status: code });
      constant(ApiProblem, key, new ApiProblem(type));
      registerProblemType(type);
    }
  }
}

module.exports = ApiProblem;
