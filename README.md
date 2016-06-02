# node-api-problem [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Http Api Problem Utility

## Installation

```sh
$ npm install --save node-api-problem
```

## Why use Api Problem

When you developed some Rest Api, you commonly have to return error. Api Problem (following the #rfc7807)
defined a way to carry machine-readable details of errors in a HTTP response to avoid the need to define new error
response formats for HTTP APIs.

Api Problem should be compliant with the #rfc7807. The main definition of an Api Problem
is defined in the #rfc7807 like that :

```

A problem details object can have the following members:

   o  "type" (string) - A URI reference [RFC3986] that identifies the
      problem type.  This specification encourages that, when
      dereferenced, it provide human-readable documentation for the
      problem type (e.g., using HTML [W3C.REC-html5-20141028]).  When
      this member is not present, its value is assumed to be
      "about:blank".

   o  "title" (string) - A short, human-readable summary of the problem
      type.  It SHOULD NOT change from occurrence to occurrence of the
      problem, except for purposes of localization (e.g., using
      proactive content negotiation; see [RFC7231], Section 3.4).

   o  "status" (number) - The HTTP status code ([RFC7231], Section 6)
      generated by the origin server for this occurrence of the problem.

   o  "detail" (string) - A human-readable explanation specific to this
      occurrence of the problem.

   o  "instance" (string) - A URI reference that identifies the specific
      occurrence of the problem.  It may or may not yield further
      information if dereferenced.
```

The #rfc precise another important point :

```
Problem type definitions MAY extend the problem details object with additional members.
```

If you use Api Problem, you will able to create custom Api Problem and precise
any members you need and transform the "MAY" to a "MUST". This can be very
useful if you have to reuse the same Api Problem in different circumstances.

One of the other interesting point of Api Problem is that it extend the
`Error` object that let you the ability to have a full documented error
if you need.

## Limitation

The `instance` parameter is not yet implemented.

## Usage

```js
var ApiProblem = require('node-api-problem');

var Issue12Problem = new ApiProblem('http://api.acme.com/kb/issues/12','Error documented by issue 12');
```


### Create an Api Problem on the Fly

```js
var Issue12Problem = new ApiProblem('http://api.acme.com/kb/issues/12','Error documented by issue 12');

// or simply

var Issue12Problem = new ApiProblem('http://api.acme.com/kb/issues/12');
```

When you create an Api Problem on the fly, you will create internally a new Problem Type. This can be check easily :

```js
var Issue12Problem = new ApiProblem('http://api.acme.com/kb/issues/12','Error documented by issue 12');
ApiProblem.lookupProblemType('http://api.acme.com/kb/issues/12'); // true
```

### Use a pre-registered HTTP Api Problem

```js
var GoneProblem = ApiProblem.GONE;
```

### Create a Custom Api Problem

```js
var IssueApiProblem = ApiProblem.create();
var Issue12Problem = new IssueApiProblem('http://api.acme.com/kb/issues/12');
```

The creation of Custom Api Problem is very useful because you can add custom variable
in a specific namespace without denatured the root Api Problem.

```js
var CustomApiProblem = ApiProblem.create();

var ValidationProblem = function(validation) {
  if(validation === 12) {
    validation = 42;
  }
  return new CustomApiProblem('http://api.acme.com/doc/validations', {'validation' : validation});
};

var validationIssue = new ValidationProblem(12);
echo validationIssue.validation; // 42
```

### Add Custom Type to Api Problem
Pre-registered Type is good. We planned in the future the ability to lock the creation of Problem Type on the fly.

```js
ApiProblem.registerProblemType('http://api.acme.com/kb/issues/12','Error documented by issue 12');
ApiProblem.lookupProblemType('http://api.acme.com/kb/issues/12'); // true
```

### Throw an Api Problem
ApiProblem inherit from Error, you can easily throw a rich Api Problem using `throw` :

```js
try {
    throw ApiProblem.GONE;
} catch (e) {
    e instanceOf ApiProblem; //true
    e instanceOf Error; //true
}
```

### Cast Api Problem
An Api Problem can be cast to string :

```js
String(ApiProblem.GONE); // "HTTP-Problem: [410] Gone > http://www.iana.org/assignments/http-status-codes#410"
```

An Api Problem can either be cast to a JSON string :

```js
JSON.stringify(ApiProblem.GONE); // {\"type\":\"http://www.iana.org/assignments/http-status-codes#410\",\"title\":\"Gone\",\"status\":410}
```

### Use Api Problem in a middleware

```js
function apiProblemMiddleware(err,req,res,next) {
  if (err instanceof ApiProblem) {
    err.send(res);
  } else {
    next();
  }
}
```

## License

MIT © [Romain DARY &lt;romain.dary@eoko.fr&gt; http://eoko.fr](http://eoko.fr)


[npm-image]: https://badge.fury.io/js/node-api-problem.svg
[npm-url]: https://npmjs.org/package/node-api-problem
[travis-image]: https://travis-ci.org/iam-merlin/node-api-problem.svg?branch=master
[travis-url]: https://travis-ci.org/iam-merlin/node-api-problem
[daviddm-image]: https://david-dm.org/iam-merlin/node-api-problem.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/iam-merlin/node-api-problem
[coveralls-image]: https://coveralls.io/repos/iam-merlin/node-api-problem/badge.svg
[coveralls-url]: https://coveralls.io/r/iam-merlin/node-api-problem
