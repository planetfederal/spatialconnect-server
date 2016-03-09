//mocha test code
var assert = require('assert');
import history from './web/index.js/history';

describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

var five=5;
describe('#five()', function () {
  it.only('should return true', function () {
    assert.equal(five, 5);
  });
});

//access the history function from index.js and check its arguments
describe('history', function() {
  describe('#history()', function() {
    it('should contain a store argument', function() {

    });
  });
});

//When testing synchronous code, omit the callback and Mocha will automatically continue on to the next test.
describe('Array', function() {
  describe('#2ndindexOf()', function() {
    it('should return -1 when the value is not present', function() {
      [1,2,3].indexOf(5).should.equal(-1);
      [1,2,3].indexOf(0).should.equal(-1);
    });
  });
});

//Testing asynchronous code with Mocha could not be simpler! Simply invoke the callback when your test is complete. By adding a callback (usually named done) to it() Mocha will know that it should wait for completion.
//define User
describe('User', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User('Luna');
      user.save(function(err) {
        if (err) throw err;
        done();
      });
    });
  });
});

//To make things even easier, the done() callback accepts an error, so we may use this directly:
//define User
describe('User', function() {
  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new User('Luna');
      user.save(done);
    });
  });
});

//egghead tutorial
// var helloWorld = {
//   init() {
//     return 'hello world';
//   }
// };
// export default helloWorld;

describe('helloWorld', function() {
  describe('#init()', function() {
    it.skip('should return hello world', function() {
      assert.equal(helloWorld.init(), 'hello world');
    });
  });
});
