'use strict';

require('chai').should();

const Tools = require('../lib/tools');

const uri = 'http://api.doc';

describe('Absolute URI definition', () => {
  it('An URI must be absolute', () => {
    Tools.absolute(uri).should.be.equal(true);
    Tools.absolute('sample').should.be.equal(false);
  });
});

describe('Constant definition', () => {
  it('A constant can be hidden from enumerable', () => {
    let object = {};

    Tools.constant(object, 'hidden', '42', true);
    Tools.constant(object, 'show', '42', false);

    for (var i in object) {
      if ({}.hasOwnProperty.call(object, i)) {
        i.should.be.equal('show');
        object[i].should.be.equal('42');
      }
    }

    object.hidden.should.be.equal('42');
  });

  it('A constant can be initialize', () => {
    let object = {};

    Tools.constant(object, 'value', '42');
    object.value.should.be.equal('42');
  });

  it('A constant is immutable', () => {
    let object = {};

    Tools.constant(object, 'immutable', '42');

    (function () {
      object.immutable = 12;
    }).should.throw(Error);
  });
});

