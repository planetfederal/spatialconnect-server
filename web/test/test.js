//mocha test code
require("babel/register");
var assert = require('assert');
import history from '../../index';
import store from '../../index';
import AddEvent from '../../components/AddEvent';
import actions from '../../containers/EventsContainer';
import events from '../../ducks/events';
import NewEventForm from '../../components/NewEventForm';

//test that the output is an unordered list and that the list items are links
var ol='<ol>';
var a='<a href=';
var oloutput='<ol><li><a href="">one</a></li><li><a href="">two</a></li><li><a href="">three</a></li></ol>';
describe('#oloutput()', function () {
  it('should return false', function () {
    oloutput.indexOf(ol).should.equal(-1);
  });
});

describe('#links()', function () {
  it.only('should return false', function () {
    oloutput.indexOf(a).should.equal(-1);
  });
});

//check that there is an onClick handler in the button
describe('#AddEvent()', function () {
  it('should return false', function () {
    AddEvent.indexOf('onClick').should.equal(-1);
  });
});

//New Event Form Component
describe('#NewEventForm()', function () {
  it('should return false', function () {
    NewEventForm.indexOf('input').should.equal(-1);
  });
});

//Async actionCreator test (currently failing)...but where is the previous test?
describe('#actions()', function() {
    it('should contain actions', function() {
      //use map to run through actions?
      assert.equal(actions[i], events[i]);
    });
});

//access the history function from index.js and check its arguments
describe('#history()', function() {
    it('should contain a store argument', function() {
      //use map to run through arguments?
      assert.equal(history.arguments[i], store);
    });
});

//Fix double callback error
describe('#doublecallback()', function() {
    it('should return a callback', function() {
      assert.equal(callbackfunction, callback);
    });
});

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
  it('should return true', function () {
    assert.equal(five, 5);
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
