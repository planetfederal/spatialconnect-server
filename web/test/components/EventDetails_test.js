'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import EventDetails from '../../components/EventDetails';
import testEvents from '../data/mockEvents';

describe('EventDetails', function() {

  function setup(props={}) {
    let defaultProps = {
      params: {id: testEvents[0].id}
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <EventDetails {...props} />
    );

    return {
      component: component
    };
  }

  it('should render correctly', function(){
    const { component } = setup();
    expect(component.type()).toBe('div')
    expect(component.find('h4').length).toBe(1)
  });

});
