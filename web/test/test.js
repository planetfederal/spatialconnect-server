//mocha test code
//require("babel/register");
var assert = require('assert');
var expect = require('expect');
import React from '../../node_modules/react';
import ReactAddons from '../../node_modules/react-addons-test-utils';
import TestUtils from '../../node_modules/react-addons-test-utils';
//.DocumentRevisions-V100/import store from '../index';
import AddEvent from '../components/AddEvent';
import actions from '../containers/EventsContainer';
import events from '../ducks/events';
import NewEventForm from '../components/NewEventForm';

//react Jest test example
// <button ref="button">...</button>
var node = NewEventForm.button.type.submit;
ReactTestUtils.Simulate.click(node);

//redux testing recipe
function setup() {
  let props = {
    NewEventForm: expect.createSpy()
  }

  let renderer = TestUtils.createRenderer()
  renderer.render(<NewEventForm {...props} />)
  let output = renderer.getRenderOutput()

  return {
    props,
    output,
    renderer
  }
};

describe('components', () => {
  describe('NewEventForm', () => {
    it('should render correctly', () => {
      const { output } = setup()

      expect(output.type).toBe('string')
      expect(output.props.className).toBe('object')

      //let [ h1, input ] = output.props.children

      //expect(h1.type).toBe('h1')
      //expect(h1.props.children).toBe('NewEventForms')

      //expect(input.type).toBe(NewEventForm)
      //expect(input.props.NewEventForm).toBe(true)
      expect(input.props.placeholder).toBe('What needs to be done?')
    })

    it('should call NewEventForm', () => {
      const { output, props } = setup()
      let input = output.props.children[1]
      input.props.onSave('')
      //expect(props.NewEventForm.calls.length).toBe(0)
      input.props.onSave('Use Redux')
      //expect(props.NewEventForm.calls.length).toBe(1)
    })
  })
});

//check that AddEvent is a string
var typeofAddEvent=typeof(AddEvent);
describe('AddEventType', function() {
  describe('#AddEventType()', function () {
    it('should return true', function () {
      assert.equal(typeofAddEvent, 'function');//returns true
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

var five=5;
describe('#five()', function () {//passes
  it('should return true', function () {
    assert.equal(five, 5);
  });
});
