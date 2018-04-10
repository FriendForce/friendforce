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
    DataStore.addPerson({id:-1, name:'john doe'});
    DataStore.resetData();
    var newNumPersons = DataStore.persons().length;
    expect(newNumPersons).toEqual(0);
  });
  it('successfully adds person', () => {
    var oldNumPersons = DataStore._persons.length;
    DataStore.addPerson({id:-1, name:'john doe'}).then(()=>{
      var newNumPersons = DataStore.persons().length;
      expect(newNumPersons-oldNumPersons).toEqual(1);
      DataStore.resetData();
    });

  });
  it('successfully adds tags', () => {
    var oldNumTags = DataStore.tags().length;
    DataStore.addTag({id:'z', label:'foo', 'originator':'0', 'subject':'0', 'publicity':'public'}).then(()=>{
      var newNumTags = DataStore.tags().length;
      expect(newNumTags-oldNumTags).toEqual(1);
      DataStore.resetData(); 
    });

  });
  it('successfully adds tags', () => {
    DataStore.addPerson({id:'z', name:'john doe'});
    DataStore.getPersonsByName('john doe').then((result)=> {
      expect(result.id).toEqual('z');
      DataStore.resetData();
    })
  });
  it('personsToNameArray', () => {
    var name = 'john doe';
    DataStore._persons=[{id:'z', name:name}];
    DataStore.personsToNameArray().then((names)=> {
      expect(names.length).toEqual(1);
      expect(names[0]).toEqual(name);
      DataStore.resetData(); 
    });
    
  });
  it('tagsToLabelArray', () => {
    var label = 'foo';
    DataStore._tags=[{id:'z', label:label, 'originator':'0', 'subject':'0', 'publicity':'public'}];
    DataStore.tagsToLabelArray().then((labels)=>{
      expect(labels.length).toEqual(1);
      expect(labels[0]).toEqual(label);
      DataStore.resetData();
    });
  });
  //Todo - coverage for getpersonsbyname
})
