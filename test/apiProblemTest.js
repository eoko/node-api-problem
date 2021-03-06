'use strict';

const status = require('http-status');
const _ = require('lodash');
const should = require('chai').should;

should();

const ApiProblem = require('../lib/apiProblem');
const ProblemType = require('../lib/problemType');

const uri = 'http://api.doc1';
const uri2 = 'http://api.doc2';
const uri3 = 'http://api.doc3';
const uri4 = 'http://api.doc4';

describe('New API Problem definition', () => {
  it('An API Problem should reference a Type', () => {
    (new ApiProblem(uri)).type.should.be.equal(uri);
    (() => new ApiProblem('http://sample.com/2', { status: 1 })).should.throw();
    (() => new ApiProblem(null)).should.throw();
  });

  it('An API Problem can reference an instance', () => {
    const ap = new ApiProblem(uri);
    ap.instance = 'sample';
    ap.instance.should.be.equal('sample');

    ap.instance = undefined;
    should().not.exist(ap.instance);

    ap.detail = 'sample';
    ap.detail.should.be.equal('sample');

    ap.detail = undefined;
    should().not.exist(ap.detail);
  });

  it('An API Problem can reference a previously created Type', () => {
    const pt = new ProblemType(uri2);
    (new ApiProblem(pt)).type.should.be.equal(uri2);

    ApiProblem.GONE.type.should.be.equal('http://www.iana.org/assignments/http-status-codes#410');
    ApiProblem.GONE.should.be.instanceOf(ApiProblem);
    ApiProblem.Blank.should.be.instanceOf(ApiProblem);
  });

  it('An API Problem can reference a previously registered Type', () => {
    ApiProblem.registerProblemType(uri, 'coucou');
    (ApiProblem.lookupProblemType(uri)).type.should.be.equal(uri);

    ApiProblem.registerProblemType('http://sample.com');
    (ApiProblem.lookupProblemType('http://sample.com')).type.should.be.equal('http://sample.com');

    (() => ApiProblem.registerProblemType(42, 'coucou')).should.throw();

    const pt = new ProblemType(uri3);
    ApiProblem.registerProblemType(pt);
    (ApiProblem.lookupProblemType(uri3)).type.should.be.equal(uri3);

    (new ApiProblem('http://sample.com/with/options', { status: 404, detail: 'Wow', instance: {}, title: 'nothing' })).status.should.equal(404);

    ApiProblem.forStatus(404).status.should.be.equal(404);
  });

  it('An API problem can override type', () => {
    ApiProblem.OK.constant('magic', 42);
    ApiProblem.OK.magic.should.be.equal(42);
  });

  it('An API Problem must reference usual HTTP Problem', () => {
    _(status).each((v, k) => {
      if (isNaN(k) && v >= 200) {
        ApiProblem[k.toString()].should.be.an('Object');
      }
    });
  });

  it('An API Problem can be created from a Problem Type', () => {
    const pt = new ProblemType(uri4, 'sample');
    (new ApiProblem(pt)).type.should.be.equal(uri4);
  });

  it('Custom API Problem can be created from factory', () => {
    const CustomApiProblem = ApiProblem.create();
    const apcc = new CustomApiProblem(uri);

    apcc.should.be.an.instanceOf(ApiProblem);
  });

  it('Custom API Problem can be wrapped for custom rules', () => {
    const CustomApiProblem = ApiProblem.create();

    const ValidationProblem = function (validation) {
      let newVal = validation;

      if (validation === 12) {
        newVal = 42;
      }
      return new CustomApiProblem(uri, { validation: newVal });
    };

    (new ValidationProblem(12)).should.be.an.instanceOf(ApiProblem);
    (new ValidationProblem(12)).validation.should.be.equal(42);
  });

  it('An API Problem should be throwable', () => {
    const ap = new ApiProblem(uri);

    (() => { throw ap; })
      .should.throw()
      .and.be.instanceOf(ApiProblem);

    (() => { throw ApiProblem.GONE; })
      .should.throw()
      .and.be.instanceOf(ApiProblem)
      .and.be.instanceOf(Error);

    const CustomApiProblem = ApiProblem.create();

    const ValidationProblem = function (validation) {
      let newVal = validation;

      if (validation === 12) {
        newVal = 42;
      }
      return new CustomApiProblem(uri, { validation: newVal });
    };

    const a = new ValidationProblem(12);

    (() => { throw a; })
      .should.throw()
      .and.be.instanceOf(CustomApiProblem)
      .and.be.instanceOf(ApiProblem)
      .and.be.instanceOf(Error);
  });

  it('An API Problem should be nicely format for JSON string', () => {
    const ap = new ApiProblem(uri);
    (JSON.stringify(ap)).should.be.equal('{"type":"http://api.doc1","title":"coucou"}');
    (JSON.stringify(ApiProblem.GONE)).should.be.equal('{"type":"http://www.iana.org/assignments/http-status-codes#410","title":"Gone","status":410}');
  });

  it('An API Problem should be nicely format for string', () => {
    const ap = new ApiProblem(uri);
    (String(ap)).should.be.equal('HTTP-Problem: [undefined] coucou > http://api.doc1'); // don't forget that `uri` has been defined previously.
    (String(ApiProblem.GONE)).should.be.equal('HTTP-Problem: [410] Gone > http://www.iana.org/assignments/http-status-codes#410');
  });
});

