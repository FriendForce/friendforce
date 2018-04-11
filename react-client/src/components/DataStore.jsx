import React from 'react';
//Remove these when we're done with constant data
import persons from './ConstData/persons.js';
import tags from './ConstData/tags.js';

class DataStore {
  constructor(){
     // TODO: Change what gets loaded 
     this._data = [];
     this.loadExternalPersons(persons);
     this.loadExternalTags(tags);
  }

  resetData(){
    /**
     * Deletes all local data in the datastore
     */
    this._persons = [];
    this._tags = [];
  }

  personsToNameArray(){
    /**
     * Creates a duplicate-free array of names from the datastore
     * @return {String Array} array of names
     */
    var persons_set = this._persons.map(x => x.name);
    var persons_array = Array.from(new Set(persons_set));
    return Promise.resolve(persons_array);
  };

  tagsToLabelArray(){
    /**
     * Creates a duplicate-free array of labels from the datastore
     * @return {String Array} array of labels
     */
    var label_set = this._tags.map(x => x.label);
    var label_array = Array.from(new Set(label_set));
    return Promise.resolve(label_array);
  }

  loadExternalPersons(persons){
     /**
     * Loads a list of external Persons into the DataStore
     * @param persons {Person Array} 
     */
    this._persons = persons;
  }

  loadExternalTags(tags){
    /**
     * Loads a list of external Tags into the DataStore
     * @param persons {Tag Array} 
     */
    this._tags = tags;
  }

  addPerson(person){
    /**
     * Adds a person object to the Datastore
     * @param person {Person} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
    return Promise.resolve(this._persons.push(person));
  }

  addTag(tag){
    /**
     * Adds a Tag object to the Datastore
     * @param tag {Tag} with populated fields
     * @return {Promise} promise resolves when tag successfully added
     */
    return Promise.resolve(this._tags.push(tag));
  }

  getPersonsByName(name){
    /**
     * Gets all the persons with a name
     * @param name {string} name to search by
     * @return {Promise} promise for a {Person Array} of Persons
     *          with the given name
     */
    return Promise.resolve(this._persons.filter(d => d.name == name));
  }

  getAllPersons(){
    /**
     * Gets all the Persons in the Datastore
     * @return {Promise} promise for a {Person Array} of all Persons
     */
    return Promise.resolve(this._persons);
  }

  getAllTags(){
    /**
     * Gets all the Tags in the Datastore
     * @return {Promise} promise for a {Tag Array} of all Tags
     */
    return Promise.resolve(this._tags);
  }

  getTagsBySubject(id){
    /**
     * Gets all the Tags with a specific subject
     * @param id {String} the uuid of the subject of a tag to search by
     * @return {Promise} promise for a {Tag Array} of Tags
     *          with the given subject
     */
    return Promise.resolve(this._tags.filter(tag => tag.subject == id));
  }

  getNameArray(){
    /**
     * Gets an array of all the names of persons in the datastore
     * @return {Promise} promise for a {String Array} of all names 
     */
    return Promise.resolve(this.personsToNameArray());
  }

  getLabelArray(){
    /**
     * Gets an array of all the labels of all tags in the Datastore
     * @return {Promise} promise for a {String Array} of all labels 
     */
    return Promise.resolve(this.tagsToLabelArray());
  }

  /* test code */
  persons() {
    return this._persons;
  }

  tags() {
    return this._tags;
  }

  data() {
    return this._data;
  }

  /* end test code */


}

export default new DataStore();