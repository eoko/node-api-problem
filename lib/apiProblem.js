'use strict';

const util = require('util');
const http = require('http-status');
const prefix = 'http://www.iana.org/assignments/http-status-codes#';

const ProblemType = require('./problemType');
const constant = require('./tools').constant;

const ERR_STATUS = 'status must be a valid HTTP Error Status Code';
const ERR_TYPE = 'type must be a string or Problem.Type';
const ERR_TYPESPEC = 'type must be specified';
const ERR_TYPEURL = 'type must be an absolute URI';
const ERR_PROBTYPE = 'Not a valid problem type';

const _status = Symbol('status');
const _detail = Symbol('detail');
const _instance = Symbol('instance');

const registeredTypes = {};

function lookupProblemType(type) {
  return registeredTypes[type];
}

function forCode(code) {
  return lookupProblemType(prefix + code);
}

function ApiProblem(type, options) {
  if (!(this instanceof ApiProblem)) return new ApiProblem(type, options);

  options = options || {};

  let ptype = toProblemType(type) || ApiProblem.BLANK;

  Error.captureStackTrace(this, this.constructor);

  constant(this, 'name', 'HTTP-Problem', true);
  constant(this, 'message', ptype.toString(), true);
  constant(this, 'type', ptype.type);
  constant(this, 'title', options.title || ptype.title);

  if (options.status !== undefined && options.status !== null) {
    options.status = parseInt(options.status);

    if (isNaN(options.status) || options.status < 200 || options.status > 999) throw new TypeError(ERR_STATUS);
  }

  for (let key in options) {
    if (key === 'status')
      this.status = options.status;
    else if (key === 'detail')
      this.detail = options.detail;
    else if (key === 'instance')
      this.instance = options.instance;
    else if (key === 'type' || key === 'title') {
      continue;
    }
    else {
      constant(this, key, options[key]);
    }
  }

  if (!this.status && ptype.status) this.status = ptype.status;

}

function create() {
  var func = function CustomProblem(type, options) {
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
    return true;
  } else {
    throw new TypeError(ERR_PROBTYPE);
  }
}

function toProblemType(type) {
  if (!type) {
    return undefined;
  } else if (type instanceof ProblemType) {
    return type;
  } else if (typeof type === 'string') {
    return lookupProblemType(type) || new ProblemType(type);
  }
  else {
    throw new TypeError(ERR_TYPE);
  }
}

ApiProblem.prototype.toJSON = function () {
  let obj = {};
  for (var key in this) {
    obj[key] = this[key];
  }
  return obj;
};


ApiProblem.prototype.send = function (res) {
  let status = this.status || 400;
  res.setHeader('Content-Type', 'application/problem+json');
  res.status = status;
};

ApiProblem.prototype.constant = function (name, value) {
  constant(this, name, value);
  return this;
};

Object.defineProperty(ApiProblem.prototype, 'detail', {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_detail];
  },
  set: function (val) {
    if (val === undefined || val === null)
      delete this[_detail];
    else {
      this[_detail] = String(val);
    }
  }
});

Object.defineProperty(ApiProblem.prototype, 'instance', {
  configurable: false,
  enumerable: true,
  get: function () {
    return this[_instance];
  },
  set: function (val) {
    if (val === undefined || val === null)
      delete this[_instance];
    else {
      this[_instance] = String(val);
    }
  }
});

util.inherits(ApiProblem, Error);

constant(ApiProblem, 'create', create);
constant(ApiProblem, 'registerProblemType', registerProblemType);
constant(ApiProblem, 'lookupProblemType', lookupProblemType);
constant(ApiProblem, 'Blank', new ApiProblem('about:blank', ''));
constant(ApiProblem, 'forStatus', forCode);

for (let key in http) {
  if (isNaN(key)) {
    let code = http[key];
    if (code >= 200) {
      var type = new ProblemType(prefix + code, http[code], {status: code});
      constant(ApiProblem, key, new ApiProblem(type));
    }
  }
}

/**
 *
 * @class ApiProblem
 */
module.exports = ApiProblem;