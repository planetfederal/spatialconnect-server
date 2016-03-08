//mocha test code
var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

var five=5;
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(five, 5);
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
    it('should return hello world', function() {
      assert.equal(helloWorld.init(), 'hello world');
    });
  });
});
