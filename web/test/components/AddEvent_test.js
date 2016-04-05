'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import AddEvent from '../../components/AddEvent';

describe('AddEvent', function() {

  function setup(props={}) {
    let defaultProps = {
      onClick: expect.createSpy()
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <AddEvent {...props} />
    );

    return {
      component: component
    };
  }

  it('should render correctly', function(){
    const { component } = setup();
    expect(component.type()).toBe('button')
  });

});
