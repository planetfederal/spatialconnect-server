'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import { shallow } from 'enzyme';
import { DataStoresContainer } from '../../containers/DataStoresContainer';
import DataStoresList from '../../components/DataStoresList';
import DataStoreForm from '../../components/DataStoreForm';
import mockDataStores from '../data/mockDataStores';

let props = {
  loading: false,
  stores: mockDataStores,
  addingNewDataStore: false,
  newDataStoreId: 'new data store id',
  forms: {}
};

describe('DataStoresContainer', function() {

  function setup() {
    const component = shallow(
      <DataStoresContainer {...props} />
    );

    return {
      component: component
    };
  }

  it('should exist', function(){
    const { component } = setup();
    expect(component.hasClass('wrapper')).toBe(true);
  });

  it('should not be loading', () => {
    const { component } = setup()
    expect(component.find('p').text()).toMatch(/^$/);
  });

  it('should be render loading message when loading is true', () => {
    const { component } = setup()
    component.setProps({loading: true});
    expect(component.find('p').text()).toMatch(/Fetching Data Stores.../);
  });

  it('should have DataStoreList', () => {
    const { component } = setup()
    expect(component.find(DataStoresList).length).toEqual(1);
  });

});
