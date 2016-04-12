'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import { NewEventForm, validate } from '../../components/NewEventForm';
import mockEvents from '../data/mockEvents';

const fields =  ['name', 'description']

describe('NewEventForm', function() {

  function makefields() {
    let fieldObj = {}
    Object.keys(mockEvents[0]).forEach(f => {
      fieldObj[f] = { name: f, initialValue: mockEvents[0][f] }
    })
    return fieldObj
  }

  function setup(props={}) {
    let defaultProps = {
      form: 'newEvent',
      fields: makefields(),
      handleSubmit: expect.createSpy()
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <NewEventForm {...props} />
    );

    return {
      component: component,
      props: props
    };
  }

  it('should exist', function(){
    const { component } = setup();
    expect(component.type()).toBe('form');
    expect(component.find('input').length).toBe(1);
    expect(component.find('textarea').length).toBe(1);
  });

  it('should call handleSubmit on submit', function(){
    const { props, component } = setup();
    component.find('form').simulate('submit');
    expect(props.handleSubmit).toHaveBeenCalled();
  });

  it('should validate', function(){
    const { component } = setup();
    expect(validate(mockEvents[0])).toEqual({});
  });

  it('should return errors on validate', function(){
    const { component } = setup();
    expect(validate({})).toEqual({
      name: 'Required',
      description: 'Required'
    });
  });

});
