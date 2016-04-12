'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils, { createRenderer } from 'react-addons-test-utils';
import expect from 'expect';
import { shallow } from 'enzyme';
import DataStoreItem from '../../components/DataStoreItem';
import DataStoreForm from '../../components/DataStoreForm';
import dataStores from '../data/mockDataStores';

describe('DataStoreItem', function() {

  function setup(props={}) {
    let defaultProps = {
      dataStore: {},
      onSubmit: () => {}
    };
    props = Object.assign(defaultProps, props);

    const component = shallow(
      <DataStoreItem {...props} />
    );

    return {
      component: component
    };
  }

  it('should exist', function(){
    const { component } = setup();
    expect(component.type()).toBe('li')
  });

  it('should render 1 data store form when passed 1 store in the props', () => {
    const {component} = setup({dataStore: dataStores[0]});
    expect(component.find(DataStoreForm).length).toBe(1);
  });

  it('should setup the initialValues of the form component', () => {
    const {component} = setup({dataStore: dataStores[0]});
    expect(component.find(DataStoreForm).at(0).props().initialValues).toBe(dataStores[0]);
  });

  it('should set the formKey as the storeId', () => {
    const {component} = setup({dataStore: dataStores[0]});
    expect(component.find(DataStoreForm).at(0).props().formKey).toBe(dataStores[0].storeId);
  });

});
