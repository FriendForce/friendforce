
//Remove these when we're done with constant data

import persons from './ConstData/persons.js';
import tags from './ConstData/tags.js';
import firebaseStyleTags from './ConstData/firebaseStyleTags.js';
import firebaseStylePersons from './ConstData/firebaseStylePersons.js';
import firebaseConfig from './ConstData/firebase_config.js';
import firebase from 'firebase';
import 'firebase/firestore';



class DataStore {
  constructor(){
     // TODO: Change what gets loaded 
     this._data = [];

     firebase.initializeApp(firebaseConfig);
     this.firestore = firebase.firestore();
     const settings = {timestampsInSnapshots: true};
     this.firestore.settings(settings);
     this._personDiffs = [];
     this._tagDiffs = [];
     this._labelList = [];
     this._persons_new = new Map();
     this._tags_new = new Map();
     this.loadExternalPersons(persons);
     this.loadExternalTags(tags);

  }



  _nameToId(name) {
    return name.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
  } 

  _tagToId(tag) {
    return tag.label.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
  }

  firebaseSync(user) {
    //Pull from firestore
    //Push Diffs to firestore
    //console.log("syncing");
    //proably should use batch here
    this._personDiffs.forEach((person)=>{this.firebasePushPerson(person, user);});
    this._personDiffs = [];
    this._tagDiffs.forEach((tag)=>{this.firebasePushTag(tag)});
    this._tagDiffs = [];
  }

  firebasePushPerson(person, user_id) {
    // create storage 
    var stagedfirestorePerson = person;
    const id = person.id;
    delete stagedfirestorePerson.id;
    stagedfirestorePerson.knownPersons = {};
    stagedfirestorePerson.knownByPersons[user_id] = true;
    console.log(id + " " + user_id);
    var firestorePerson = this.firestore.collection("persons").doc(id);
    firestorePerson.set(stagedfirestorePerson, {merge:true})
    .then(function(){console.log("set person")})
    .catch(function(error){console.log("caught error " + error)});

    var firestoreUser = this.firestore.collection("persons").doc(user_id);
    var updatedData = {knownPersons:{}};
    updatedData.knownPersons[id] = true;
    console.log(updatedData);
    firestoreUser.set(updatedData, {merge:true})
      .then(function(){console.log("set user")})
      .catch(function(error){console.log("caught error " + error)});
  }

  firebasePushTag(tag) {
    var stagedfirestoreTag = tag;
    const id = tag.id;
    delete stagedfirestoreTag.id;
    var firestoreTag = this.firestore.collection("tags").doc(id);
    firestoreTag.set(stagedfirestoreTag, {merge:true})
    .then(function(){console.log("set tag")})
    .catch(function(error){console.log("caught error " + error)});
  }

  firebasePull(user_id) {
    // Grab all the data you're allowed to get from firebase
    //Get all people known by the user
    // TODO make this totally Async
    var p = new Promise((resolve, reject) => {
     this.firestore.collection("persons")
      .where("knownByPersons."+ user_id, "==", true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // Do things with doc.id and doc.data()
          var newPerson = doc.data();
          newPerson.id = doc.id;
          this._persons_new.set(doc.id, newPerson);
        });
      })
      .then(() => {
        var newTags = [];
        this.firestore.collection("tags")
        .where("originator", "==", user_id)
        .where("publicity", "==", "private")
        .get()
        .then((querySnapshot)=>{
          querySnapshot.forEach((doc)=>{
            var newTag = doc.data();
            newTag.id = doc.id;
            this._tags_new.set(doc.id, newTag);
          });
        })
        .then(()=>{
          this.firestore.collection("tags")
          .where("publicity", "==", "public")
          .get()
          .then((querySnapshot)=>{
            querySnapshot.forEach((doc)=>{
              var newTag = doc.data();
              newTag.id = doc.id;
              this._tags_new.set(doc.id, newTag);
            });
            resolve(true);
          })
        })
      })
      .catch(function(error) {
        console.log("Error getting persons: ", error);
      });
    });
    return p;  
  }

  firebasePush(user_id) {
    // Put data in firebase format and push it up
    this._personDiffs.forEach((person)=>{this.firebasePushPerson(person, user_id);});
    this._personDiffs = [];
    this._tagDiffs.forEach((tag)=>{this.firebasePushTag(tag)});
    this._tagDiffs = [];
  }


  resetData(){
    /**
     * Deletes all local data in the datastore
     */
    this._persons = [];
    this._tags = [];
    this._personDiffs = [];
    this._persons_new = {};
    this._tags_new = {};
  }

  loadExternalPersons(persons){
    /**
    * Loads a list of external Persons into the DataStore
    * @param persons {Person Array} 
    */
    
    Object.keys(firebaseStylePersons).forEach(key=>{
      this._persons_new.set(key, firebaseStylePersons[key]);
      //delete this._persons_new[key].knownByPersons;
    })
    
    var personsCopy = persons;
    this._persons = personsCopy.map(person => {delete personsCopy.tags; return person;});
  }

  loadExternalTags(tags){
    /**
     * Loads a list of external Tags into the DataStore
     * @param persons {Tag Array} 
     */
    Object.keys(firebaseStyleTags).forEach(key=>{
      this._tags_new.set(key, firebaseStyleTags[key]);
    })

    tags.forEach
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
     // TODO: check whether person exists in firestore

     var id = this._nameToId(name);
     var person = {
        id:id,
        name:name
      };
      this._persons.push(person);
      this._personDiffs.push(person);
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
     this._tagDiffs.push(tag);
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
     let p = new Promise(
      (resolve, reject) => {
     var personsList = [];
      this._persons_new.forEach((value,key,map)=>{
        var val = value;
        val["id"] = key;
        personsList.push(val);
      });
      resolve(personsList);
    });
    return p;
  }

  getAllTags(){
    /**
     * Gets all the Tags in the Datastore
     * @return {Promise} promise for a {Tag Array} of all Tags
     */
    //return Promise.resolve(this._tags);
    let p = new Promise(
      (resolve, reject) => {
        var tagList = [];
        this._tags_new.forEach((value,key,map)=>{
          var val = value;
          val["id"] = key;
          tagList.push(val);
        });
        resolve(tagList);
      });
    return p;
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

  numPersonDiffs() {
    return this._personDiffs.length;
  }

  resetDiffs() {
    this._personDiffs = [];
  }

  /* end test code */


}

export default new DataStore();