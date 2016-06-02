'use strict';

require('chai').should();

const ProblemType = require('../lib/problemType');

const baseURI = 'http://api.doc';
const title = 'Example of api problem';
const statusCode = 204;

describe('New Problem Type Definition', () => {
  it('A problem must have a title, a status and title', () => {
    const pb = new ProblemType(baseURI, title, { status: statusCode });

    pb.status.should.be.equal(statusCode);
    pb.title.should.be.equal(title);
    pb.type.should.be.equal(baseURI);
  });

  it('A problem must be human readable', () => {
    ((new ProblemType(baseURI, title, { status: statusCode })).toString())
      .should.be.equal('[204] Example of api problem > http://api.doc');
  });

  it('A problem must have a primitive value', () => {
    ((new ProblemType(baseURI, title, { status: statusCode })).valueOf())
      .should.be.equal(baseURI);
  });
});

describe('A Problem Type Definition should be compliant', () => {
  it('A type must be an URI', () => {
    (() => new ProblemType('sample')).should.throw(Error);

    (new ProblemType(baseURI)).type.should.be.equal(baseURI);
  });

  it('A type must not be writable', () => {
    (() => {
      const pb = new ProblemType(baseURI);
      pb.type = 'sample';
    }).should.throw(Error);
  });

  it('A title must describe the problem', () => {
    (new ProblemType(baseURI, title)).title.should.be.equal(title);
  });

  it('A status code must be associated to the problem', () => {
    (new ProblemType(baseURI, title, { status: statusCode })).status.should.be.equal(statusCode);
  });

  it('A status code must be a valid HTTP Code', () => {
    (() => new ProblemType(baseURI, title, { status: 199 })).should.throw(Error);
    (() => new ProblemType(baseURI, title, { status: 1000 })).should.throw(Error);
    (() => new ProblemType(baseURI, title, { status: 'sample' })).should.throw(Error);

    (() => new ProblemType(baseURI, title, { status: 200 })).should.not.throw(Error);
    (() => new ProblemType(baseURI, title, { status: 999 })).should.not.throw(Error);
  });
});

