//mocha test code
//require("babel/register");
var assert = require('assert');
var expect = require('expect');
//.DocumentRevisions-V100/import store from '../index';
 import AddEvent from '../components/AddEvent';
 import actions from '../containers/EventsContainer';
 import events from '../ducks/events';
 import NewEventForm from '../components/NewEventForm';

//test that the output is an unordered list and that the list items are links
var ol='<ol>';
var a='<a href=';
var oloutput='<ol><li><a href="">one</a></li><li><a href="">two</a></li><li><a href="">three</a></li></ol>';
var typeofol=typeof(ol);
describe('#oloutput()', function () {
  it('should return false', function () {
    oloutput.indexOf(ol).should.equal(-1);
  });
});

describe('#oltype()', function () {
  it('should return true', function () {
    assert.equal(typeofol, 'string');
  });
});

describe('#links()', function () {
  it('should return false', function () {
    oloutput.indexOf(a).should.equal(-1);
  });
});

//check that AddEvent is a string
var typeofAddEvent=typeof(AddEvent);
describe('AddEventType', function() {
  describe('#AddEventType()', function () {
    it('should return true', function () {
      assert.equal(typeofAddEvent, 'function');//returns true, you need a string to evaluate the next one
    });
  });
});

//check that there is an onClick handler in the button
describe('AddEvent', function() {
  describe('#AddEvent()', function () {
    it('should return false', function () {
      AddEvent.indexOf('onClick').should.equal(-1);
    });
  });
});

var typeofNewEventForm=typeof(NewEventForm);
//New Event Form Component
describe('#NewEventForm', function () {
  //return(NewEventForm());//cannot call a class as a function
  it('should return true', function () {
    assert.equal(typeofNewEventForm, 'function');//true
  });
});

//Pass in array of events should have an unordered list
describe('#PassNewEventForm', function () {
  //console.log(NewEventForm);
  it('should return true', function () {
    var eventsArray=['event1','event2'];
    var typeofNewEventForm=typeof(NewEventForm.fields);
    assert.equal(typeofNewEventForm, 'undefined');
    //NewEventForm.indexOf('input').should.equal(-1);
  });
});

//Async actionCreator test (currently failing)...but where is the previous test?
describe('#actions()', function() {
    it('should contain actions', function() {
      //use map to run through actions?
      assert.equal(actions[i], events[i]);
    });
});

//Fix double callback error
describe('#doublecallback()', function() {
    it('should return a callback', function() {
      assert.equal(callbackfunction, callback);
    });
});

describe('Array', function() {//passes
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

var five=5;
describe('#five()', function () {//passes
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
