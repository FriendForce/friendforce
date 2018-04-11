import '../../test/test_setup'
import {shallow, mount} from 'enzyme';
import React from 'react';

import DataStore from './DataStore';

describe('DataStore', () => {
  it('can be created without throwing', () => {
    expect(DataStore.data().length).toEqual(0);
  });
  it('successfully loads persons', () => {
    expect(DataStore.persons().length).toBeGreaterThan(0);
  });
  it('successfully loads tags', () => {
    expect(DataStore.tags().length).toBeGreaterThan(0);
  });
  it('successfully resets data', () => {
    var oldNumPersons = DataStore.persons().length;
    DataStore._persons= [{id:-1, name:'john doe'}];
    DataStore.resetData();
    var newNumPersons = DataStore.persons().length;
    expect(newNumPersons).toEqual(0);
  });
  it('successfully adds person', async () => {
    var oldNumPersons = DataStore._persons.length;
    const data = await DataStore.addPerson({id:-1, name:'john doe'});
    var newNumPersons = DataStore.persons().length;
    expect(newNumPersons-oldNumPersons).toEqual(1);
    DataStore.resetData();
  });

  it('successfully adds tags', async () => {
    var oldNumTags = DataStore.tags().length;
    const data = await DataStore.addTag({id:'z', label:'foo', 'originator':'0', 'subject':'0', 'publicity':'public'});
    var newNumTags = DataStore.tags().length;
    expect(newNumTags-oldNumTags).toEqual(1);
    DataStore.resetData(); 
  });

  it('getPersonsByName', async () => {
    await DataStore.addPerson({id:'z', name:'john doe'});
    const data = await DataStore.getPersonsByName('john doe');
    expect(data[0].id).toEqual('z');
  });

  it('getTagsBySubect', async () => {
    await DataStore.addTag({id:'z', label:'foo', 'originator':'0', 'subject':'0', 'publicity':'public'});
    const data = await DataStore.getTagsBySubject('0');
    expect(data[0].id).toEqual('z');
  });

  it('personsToNameArray', async () => {
    var name = 'john doe';
    DataStore._persons=[{id:'z', name:name}];
    const names = await DataStore.personsToNameArray();
    expect(names.length).toEqual(1);
    expect(names[0]).toEqual(name);
    DataStore.resetData(); 
  });

  it('tagsToLabelArray', async () => {
    var label = 'foo';
    DataStore._tags=[{id:'z', label:label, 'originator':'0', 'subject':'0', 'publicity':'public'}];
    const labels = await DataStore.tagsToLabelArray();
    expect(labels.length).toEqual(1);
    expect(labels[0]).toEqual(label);
    DataStore.resetData();
  });
  
})
