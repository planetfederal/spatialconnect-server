'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import * as events from '../../ducks/events';
import { DataStoreForm, validate } from '../../components/DataStoreForm';
import mockDataStores from '../data/mockDataStores';

describe('DataStoreForm', function() {

  function makefields() {
    let fieldObj = {}
    Object.keys(mockDataStores[0]).forEach(f => {
      fieldObj[f] = { name: f, initialValue: mockDataStores[0][f] }
    })
    return fieldObj
  }

  function setup(props={}) {
    let defaultProps = {
      form: 'dataStore',
      fields: makefields()
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <DataStoreForm {...props} />
    );

    return {
      component: component
    };
  }

  it('should render correctly', function(){
    const { component } = setup();
    expect(component.type()).toBe('form');
    expect(component.find('input').length).toBe(3);
    expect(component.find('select').length).toBe(1);
  });


  it('should validate', function(){
    const { component } = setup();
    expect(validate(mockDataStores[0])).toEqual({});
  });

  it('should return errors on validate', function(){
    const { component } = setup();
    expect(validate({})).toEqual({
      storeId: 'Required',
      name: 'Required',
      type: 'Required',
      version: 'Required'
    });
  });

});
