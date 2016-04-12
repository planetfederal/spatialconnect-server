'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import EventsList from '../../components/EventsList';
import testEvents from '../data/mockEvents';

describe('EventList', function() {

  function setup(props={}) {
    let defaultProps = {
      eventsList: []
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <EventsList {...props} />
    );

    return {
      component: component
    };
  }

  it('should exist', function(){
    const { component } = setup();
    expect(component.type()).toBe('ul')
  });

  it('should render 1 event when passed 1 event in the props', () => {
    const {component} = setup({eventsList: testEvents});
    expect(component.children().length).toBe(1);
  });

  it('should set EventItem event as event', () => {
    const {component} = setup({eventsList: testEvents});
    expect(component.childAt(0).props().event).toBe(testEvents[0]);
  });

});
