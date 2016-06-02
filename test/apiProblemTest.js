'use strict';

var status = require('http-status');
var _ = require('lodash');

require('chai').should();

const ApiProblem = require('../lib/apiProblem');
const ProblemType = require('../lib/problemType');

const uri = "http://api.doc1";
const uri2 = "http://api.doc2";
const uri3 = "http://api.doc3";
const uri4 = "http://api.doc4";
const title = "Example of api problem";
const statusCode = 204;

describe('New API Problem definition', () => {
  it('An API Problem should reference a Type', () => {
    (new ApiProblem(uri)).type.should.be.equal(uri);
  });

  it('An API Problem can reference a previously created Type', () => {
    let pt = new ProblemType(uri2);
    (new ApiProblem(pt)).type.should.be.equal(uri2);

    ApiProblem.GONE.type.should.be.equal('http://www.iana.org/assignments/http-status-codes#410');
    ApiProblem.GONE.should.be.instanceOf(ApiProblem);
    ApiProblem.Blank.should.be.instanceOf(ApiProblem);
  });

  it('An API Problem can reference a previously registered Type', () => {
    ApiProblem.registerProblemType(uri,'coucou');
    (ApiProblem.lookupProblemType(uri)).type.should.be.equal(uri);

    let pt = new ProblemType(uri3);
    ApiProblem.registerProblemType(pt);
    (ApiProblem.lookupProblemType(uri3)).type.should.be.equal(uri3);
  });

  it('An API Problem must reference usual HTTP Problem', () => {
    _(status).each(function(v,k) {
      if(isNaN(k) && v >= 200) {
        ApiProblem[k.toString()].should.be.an('Object');
      }
    });
  });

  it('An API Problem can be created from a Problem Type', () => {
    let pt = new ProblemType(uri4,'sample');
    (new ApiProblem(pt)).type.should.be.equal(uri4);

  });

  it('Custom API Problem can be created from factory', () => {
    let CustomApiProblem = ApiProblem.create();
    let apcc = new CustomApiProblem(uri);

    apcc.should.be.an.instanceOf(ApiProblem)
  });

  it('Custom API Problem can be wrapped for custom rules', () => {
    let CustomApiProblem = ApiProblem.create();

    let ValidationProblem = function(validation) {
      if(validation === 12) {
        validation = 42;
      }
      return new CustomApiProblem(uri, {'validation' : validation});
    };

    (new ValidationProblem(12)).should.be.an.instanceOf(ApiProblem);
    (new ValidationProblem(12)).validation.should.be.equal(42);

  });

  it('An API Problem should be throwable', () => {
    let ap = new ApiProblem(uri);

    (() => { throw ap })
      .should.throw()
      .and.be.instanceOf(ApiProblem);

    (() => { throw ApiProblem.GONE })
      .should.throw()
      .and.be.instanceOf(ApiProblem)
      .and.be.instanceOf(Error);

    let CustomApiProblem = ApiProblem.create();

    let ValidationProblem = function(validation) {
      if(validation === 12) {
        validation = 42;
      }
      return new CustomApiProblem(uri, {'validation' : validation});
    };

    let a = new ValidationProblem(12);

    (() => { throw a })
      .should.throw()
      .and.be.instanceOf(CustomApiProblem)
      .and.be.instanceOf(ApiProblem)
      .and.be.instanceOf(Error);
  });

  it('An API Problem should be nicely format for JSON string', () => {
    let ap = new ApiProblem(uri);
    (JSON.stringify(ap)).should.be.equal('{"type":"http://api.doc1","title":"coucou"}');
    (JSON.stringify(ApiProblem.GONE)).should.be.equal('{\"type\":\"http://www.iana.org/assignments/http-status-codes#410\",\"title\":\"Gone\",\"status\":410}');
  });

  it('An API Problem should be nicely format for string', () => {
    let ap = new ApiProblem(uri);
    (String(ap)).should.be.equal('HTTP-Problem: [undefined] coucou > http://api.doc1'); // don't forget that `uri` has been defined previously.
    (String(ApiProblem.GONE)).should.be.equal('HTTP-Problem: [410] Gone > http://www.iana.org/assignments/http-status-codes#410');
  });
});

