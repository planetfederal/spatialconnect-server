'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import AddDataStore from '../../components/AddDataStore';

describe('AddDataStore', function() {

  function setup(props={}) {
    let defaultProps = {
      onClick: expect.createSpy()
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <AddDataStore {...props} />
    );

    return {
      component: component
    };
  }

  it('should render correctly', function(){
    const { component } = setup();
    expect(component.type()).toBe('button');
  });

});
