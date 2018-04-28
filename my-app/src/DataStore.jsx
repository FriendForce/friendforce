
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

  _nameToId(name) {
    return name.replace(/[^A-Z0-9]/ig, "_") + crypto.getRandomValues(new Uint8Array(1));
  } 

  _tagToId(tag) {
    return tag.label.replace(/[^A-Z0-9]/ig, "_") + crypto.getRandomValues(new Uint8Array(1));
  }

  resetData(){
    /**
     * Deletes all local data in the datastore
     */
    this._persons = [];
    this._tags = [];
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

  addPersonByName(name) {
    /** NOT IMPLEMENTED
     * Creates a person by name and adds them to the Datastore. This 
     * will always create a new person - caller needs to check if person
     * already exists.
     * @param person {string Name} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
     var id = this._nameToId(name);
     var person = {
        id:id,
        name:name
      };
      this._persons.push(person);
     return Promise.resolve(person.id);
  }

  addPerson(person){
    /**
     * Adds a person object to the Datastore
     * @param person {Person} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
    return Promise.resolve(this._persons.push(person));
  }

  addTag(subject, label, originator, publicity='public'){
    /** NOT IMPLEMENTED
     * Adds a Tag object to the Datastore
     * @param subject {string->id} subject of the tag
     * @param label {string} label describing the subject
     * @param publicity {string->public,private,tag} 
          publicity level of the tag. Default='public'
     * @param originator {string->id} originator of the tag
          defaults to the active user
     * @return {Promise} promise resolves when tag successfully added
     */
     var tag = {
      id:'',
      subject:subject,
      label:label,
      publicity:publicity,
      originator:originator,
     }
     tag.id = this._tagToId(tag);
     this._tags.push(tag);
     return Promise.resolve(tag.id);
  }


  deleteTag(id) {
    /** NOT IMPLEMENTED
     * Deletes a Tag from the Datastore
     * @param id {string->id} id 
     * @return {Promise} promise resolves when tag successfully deleted
     */
  }

  deletePerson(id) {
    /** NOT IMPLEMENTED
     * Deletes a Person from the Datastore
     * @param id {string->id} id 
     * @return {Promise} promise resolves when person successfully deleted
     */
  }

  updateTag(id, params) {
    /** NOT IMPLEMENTED
     * Updates a Tag in the datastore
     * @param id {string->id} id of tag
     * @param params {dictionary} key-values to update 
     * @return {Promise} promise resolves when tag successfully updated
     */
  }

  updatePerson(id, params) {
    /** NOT IMPLEMENTED
     * Updates a Person in the datastore
     * @param id {string->id} id of person
     * @param params {dictionary} key-values to update 
     * @return {Promise} promise resolves when person successfully updated
     */
  }

  getPersonsByName(name){
    /**
     * Gets all the persons with a name
     * @param name {string} name to search by
     * @return {Promise} promise for a {Person Array} of Persons
     *          with the given name
     */
    return Promise.resolve(this._persons.filter(d => d.name === name));
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
    return Promise.resolve(this._tags.filter(tag => tag.subject === id));
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