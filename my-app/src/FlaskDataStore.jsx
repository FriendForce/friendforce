
//Remove these when we're done with constant data

import Person from './Types/Person';
import Tag from './Types/Tag';

import firebaseStyleTags from './ConstData/firebaseStyleTags.js';
import firebaseStylePersons from './ConstData/firebaseStylePersons.js';

import axios from 'axios';


//TODO: make it so the client isn't assigning ids or the ids are overwritten
// by server assigned slugs


class DataStore {
  constructor(){
     // TODO: Change what gets loaded
     this._data = [];
     this.MAX_TAG_DIFFS = 15;
     this.MAX_PERSON_DIFFS = 10;
     // Collection names changable so you can do some test dicking around
     this._personCollection = "persons";
     this._tagCollection = "tags";


     this._tagDiffs = new Map();
     this._personDiffs = new Map();
     this._labelList = [];
     this._persons = new Map();
     this._tags = new Map();
     this._labels = new Set([]);
     //this.loadExternalPersons(persons);
     //this.loadExternalTags(tags);
     this.API_SERVER = "http://localhost:5000/api";
  }

  _nameToId(name) {
    return name.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
  }

  _tagToId(tag) {
    return tag.label.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
  }

  _labelToId(label) {
    return label.replace(/[^A-Z0-9]/ig, "_");
  }

  getEnv = () => {
    var env = null;
    var parts = window.location.hostname.split('.');
    if (parts[0] === 'www') {
      parts = parts.slice(1);
    }
    if (parts[0] === 'app') {
      env = 'prod';
    } else if (parts[0] === 'localhost') {
      env = 'dev';
    } else if (parts[0] === 'friendforce-dev') {
      env = 'dev';
    } else if (parts[0] === 'friendforce-friendforce-25851') {
      env = 'prod';
    }
    if (env === 'prod') {
      // Add actual prod server locaton
      this.API_SERVER = 'https://friendforce-server.herokuapp.com/api';
    }
    return env;
  }

  firebaseSync(userId) {
     /**
     * Synchronizes data between the local Datastore and firebase
     * Also holds the rules for when to sync
     * @Param userId {string -> id} id of the current user
     */
    // Not Implemented Yet
    // Right now you're just stuck with whatever data you pulled at the beginning of the session
    //this.firebasePull(userId);
    if(this._tagDiffs.size > this.MAX_TAG_DIFFS ||
       this._personDiffs.size > this.MAX_PERSON_DIFFS) {
      console.log("Syncing!");
      this.firebasePush(userId);
    }

  }


  flaskPushTag(tag, id) {
    /**
    * Pushes a single tag to Flask
    * @Param tag {Tag} tag to push
    * @Param id {string -> id} id of the tag
    */
    var stagedTag = tag;
    axios.post(this.API_SERVER + "/tag", stagedTag)
    .then((response)=>{
      console.log("tag response")
      console.log(response);
    })
    .catch((error)=>{
      console.log("ERROR" + error);
    })
  }


  pushTag(tag, id) {
    return this.flaskPushTag(tag, id);
  }

  firebaseDeleteTag(id) {
    this.firestore.collection("tags").doc(id).delete()
    .then(()=>{console.log("tag " + id + "successfully deleted");});
  }

  flaskDeleteTag(id) {
    console.log("trying to delete tag " + id);
    let p = new Promise((resolve, reject) => {
      axios.post(this.API_SERVER + "/tag/delete", {'id':id})
      .then((response)=> {
        console.log(response.data);
        resolve(id);
        });
    })
    return p;
  }

pullLabels(userId, callback) {
  axios.post(this.API_SERVER + "/labels", {
    'userId':userId
  })
  .then((response)=>{
    console.log("got labels!")
    console.log(response);
    response.data.forEach((label)=>{
      this._labels.add(label);
    })
  })
  .catch((error)=>{
    console.log("ERROR" + error);
  })
  .then(() => {
    callback();
  })
}

pullPersons(userId, callback) {
  console.log("pulling persons with id " + userId);
  axios.post(this.API_SERVER + "/known_persons", {
    'user':userId
  })
  .then((response)=>{
    console.log("got persons!");
    console.log(response);
    response.data.forEach((person)=> {
      console.log("adding ");
      console.log(person);
      var newPerson = {};
      newPerson.id = person.slug;
      newPerson.name = person.first_name + " " + person.last_name;
      this._persons.set(newPerson.id, newPerson);
    })
  })
  .catch((error)=>{
    console.log("ERROR" + error);
  })
  .then(() => {
    console.log(this._persons);
    callback();
  })
}

pullTags(userId, callback) {
  axios.post(this.API_SERVER + "/known_tags", {
    'user':userId
  })
  .then((response)=>{
    console.log("got Tags!");
    console.log(response);
    response.data.forEach((tag) => {
      var newTag = {};
      newTag.id = tag.slug;
      newTag.subject = tag.subject;
      newTag.originator = tag.originator;
      newTag.publicty = tag.publicty;
      newTag.label = tag.text;
      this._tags.set(newTag.id, newTag);
    })
  })
  .catch((error)=>{
    console.log("ERROR" + error);
  })
  .then(() => {
    callback();
  })
}

pullEverything(userId, callback) {
  this.pullPersons(userId, callback);
  this.pullTags(userId, callback);
  this.pullLabels(userId, callback);
}

  resetData(){
    /**
     * Deletes all local data in the datastore
     */
    var p = new Promise((resolve, reject) => {
      this._persons = new Map();
      this._tags = new Map();
      this._personDiffs = new Map();
      this._tagDiffs = new Map();
      resolve(true);
    });
    return p;
  }

  loadExternalPersons(persons){
    /**
    * Loads a list of external Persons into the DataStore
    * @param persons {Person Array}
    */

    Object.keys(firebaseStylePersons).forEach(key=>{
      this._persons.set(key, firebaseStylePersons[key]);
      //delete this._persons[key].knownByPersons;
    })

  }

  loadExternalTags(tags){
    /**
     * Loads a list of external Tags into the DataStore
     * @param persons {Tag Array}
     */
    Object.keys(firebaseStyleTags).forEach(key=>{
      this._tags.set(key, firebaseStyleTags[key]);
    })
  }

  checkPersonForDuplicate(person) {
    var possibleMatchingIds = Array.from(this._persons)
    .filter((obj)=>{
      return obj[1].name === person.name || (person.email !== undefined && person.email.length > 0 && obj[1].email === person.email);

    })
    .map((obj)=>{
      return obj[0];
    });

    if(possibleMatchingIds.length > 0) {
     console.log(person.name + "matches to ");
     console.log(possibleMatchingIds);
     return possibleMatchingIds[0];
    } else {
      return null;
    }
  }

  flaskPushPerson(person, creatorUserId) {
    var stagedPerson = person;
    stagedPerson.creator = creatorUserId;
    let p = new Promise(
      (resolve, reject) => {
        // Check DB for person
        axios.post(this.API_SERVER + "/person", stagedPerson)
        .then((response)=>{
          console.log("tag response")
          console.log(response);
          resolve(response.data);
        })
        .catch((error)=>{
          console.log("ERROR" + error);
        })
      });
    return p;
  }

  addPersonByName(name, creatorUserId='', dontSync=false, email = '') {
    /** Creates a person by name & email and adds them to the Datastore. This
     * will always create a new person with a new id - caller needs to check if person
     * already exists.
     * @param name {string Name} of the person being added
     * @param creatorUserId {string creatorUserId} of the current signed in user
     * @param email {string Email} of the person being added
     * @return {Promise} promise resolves when person successfully added
     */
     // TODO: make addPerson, addTag use _persons
     let p = new Promise(
       (resolve, reject) => {
         var person = new Person('none', name);
         this.flaskPushPerson(person, creatorUserId)
         .then((response) => {
           var name = response.first_name + " " + response.last_name;
           var person = new Person(response.slug, name)
           this._persons.set(response.slug, person)
           resolve(response.slug)
         });
       }
     )
     return p;
  }

  addPerson(person, creatorUserId, dontSync=false){
    /**
     * Adds a person object to the Datastore
     * @param person {Person} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
     let p = new Promise(
       (resolve, reject) => {
         this.flaskPushPerson(person, creatorUserId)
         .then((response) => {
           var name = response.first_name + " " + response.last_name;
           var person = new Person(response.slug, name)
           this._persons.set(response.slug, person)
           resolve(response.slug)
         });
       }
     )
     return p;
  }

  getTagType(typeString) {
    if (RegExp("^Loc", 'i').test(typeString)) {
      return "location";
    } else if (RegExp("^date", 'i').test(typeString)) {
      return "date";
    } else if (RegExp("^phone", 'i').test(typeString)) {
      return "phoneNumber";
    } else if (RegExp("^email", 'i').test(typeString)) {
      return "email";
    } else if (RegExp("^send", 'i').test(typeString)) {
      return "send";
    } else {
      return "none";
    }
  }

  additionalTagLogic(tag) {

    if (tag.label.split(":").length > 1) {
      tag.type = this.getTagType(tag.label.split(":")[0]);
      console.log("special tag");
    }
    if (tag.type === "date") {
      //console.log("date detected");
      this._labels.delete(tag.label);
      tag[tag.label.split(":")[0]] = new Date(tag.label.split(":")[0]);
    }
    if (tag.type === "email") {
      this._labels.delete(tag.label);
      tag.publicity = "private";
    }
    if (tag.type === "send") {
      this._labels.delete(tag.label);
      tag.publicity = "private";
    }
    return tag;
  }

  addTag(subject, label, originator, userId, publicity='public', dontSync=false){
    /**
     * Adds a Tag object to the Datastore
     * @param subject {string->id} subject of the tag
     * @param label {string} label describing the subject
     * @param publicity {string->public,private,tag}
          publicity level of the tag. Default='public'
     * @param originator {string->id} originator of the tag
          defaults to the active user
     * @return {Promise} promise resolves when tag successfully added
     */
     var tag = new Tag(null, subject, originator, label, null, publicity);
     this._labels.add(tag.label);

     // tag = this.additionalTagLogic(tag);
     tag.id = this._tagToId(tag);
     this._tags.set(tag.id, tag);

     if (!dontSync) {
      this.pushTag(tag, tag.id);
     } else {
       this._tagDiffs.set(tag.id, tag);
     }
     return Promise.resolve(tag.id);
  }

  genLabels = () => {
    var firestoreLabels = this.firestore.collection("labels");
    this._tags.forEach(
      (tag, id) =>{
        // this is a heuristic right now
        if (tag.publicity !== "private") {
          this._labels = this._labels.add(tag.label);
          firestoreLabels.doc(this._labelToId(tag.label))
          .set({label:tag.label}, {merge:true});
        }
      });
  }

  processTags = () => {
    this._labels = new Set([]);
    this._tags.forEach(
      (tag, id) =>{
        this._labels = this._labels.add(tag.label);
        this._tags.set(id, this.additionalTagLogic(tag));
      } );
    this.saveState();
    console.log(this._labels);
  }

  dedupDB = () => {
    return null;
  }


  deleteTag(id) {
    /**
     * Deletes a Tag from the Datastore
     * @param id {string->id} id
     * @return {Promise} promise resolves when tag successfully deleted
     */
    // TODO - pop up confirmation
     // remove locally
     let p = new Promise(
       (resolve, reject) => {
         this._tags.delete(id);
         // remove from DB
         this.flaskDeleteTag(id)
         .then(resolve(id));
       }
     )
     return p;
  }

  deletePerson(id) {
    /** NOT IMPLEMENTED
     * Deletes a Person from the Datastore
     * @param id {string->id} id
     * @return {Promise} promise resolves when person successfully deleted
     */
  }

  updateTag(id, params, dontSync=false) {
    /**
     * Updates a Tag in the datastore
     * @param id {string->id} id of tag
     * @param params {dictionary} key-values to update
     * @return {Promise} promise resolves when tag successfully updated
     */
     var tag = this._tags.get(id);
     for (var param in params) {
       tag[param] = params[param];
     }
     if (!dontSync) {
      this.pushTag(tag, tag.id);
     } else {
       this._tagDiffs.set(tag.id, tag);
     }
     return Promise.resolve(id);
  }

  updatePerson(id, params, currentPersonId) {
    /**
     * Updates a Person in the datastore
     * @param id {string->id} id of person
     * @param params {dictionary} key-values to update
     * @param currentPersonId {string->id} the user id of the current logged in user
     * @return {Promise} promise resolves when person successfully updated
     */
     var person = this._persons.get(id);
     if (person === undefined) {
      person = new Person(id);
     }
     for (let param in params) {
        person[param] = params[param];
     }
     // Make sure each param exists. If it doesn't remove it for firebase.
     for (var property in person) {
      if (person.hasOwnProperty(property) && person[property] === undefined) {
        delete(person[property]);
      }
    }

    var stagedfirestorePerson = person;
    delete stagedfirestorePerson.id;
    stagedfirestorePerson.knownByPersons[currentPersonId] = true;
    console.log(id + " updated by " + currentPersonId);
    var firestorePerson = this.firestore.collection("persons").doc(id);
    firestorePerson.set(Object.assign({}, stagedfirestorePerson), {merge:true})
    .then(function(){console.log("set person")})
    .catch(function(error){console.log("caught error " + error)});

    var firestoreUser = this.firestore.collection("persons").doc(currentPersonId);
    var updatedData = {knownPersons:{}};
    updatedData.knownPersons[id] = true;
    console.log(updatedData);
    firestoreUser.set(updatedData, {merge:true})
      .then(function(){console.log("set user")})
      .catch(function(error){console.log("caught error " + error)});
    return id;
  }

  getPersonsByName(name){
    /**
     * Gets all the persons with a name
     * @param name {string} name to search by
     * @return {Promise} promise for a {Person Array} of Persons
     *          with the given name
     */
    let p = new Promise(
      (resolve, reject) => {
      var foundPersons  = Array.from(this._persons).filter(obj => obj[1].name === name).map(obj=>obj[1])
      if (foundPersons.length > 0) {
        //NOTE: this will silently fail if there are multiple people with the same email.
        resolve(foundPersons);
      } else {
        // Check DB for person
        this.firestore.collection("persons")
        .where('name','==', name)
        .get()
        .then((querySnapshot) => {
          foundPersons = [];
          querySnapshot.forEach((doc) => {
            var person = new Person(doc.id, doc.data());
            foundPersons.push(person);
          });
          resolve(foundPersons);
        });
    }
    });
    return p;
  }

  getPersonByEmail(email){
    /**
     * Gets the person with an email
     * @param email {string} email to search by
     * @return {Promise} promise for a {Person}
     *          with the given email.
     */
    let p = new Promise(
      (resolve, reject) => {
    var foundPersons  = Array.from(this._persons).filter(obj => obj[1].email === email).map(obj=>obj[1])
    if (foundPersons.length > 0) {
      //NOTE: this will silently fail if there are multiple people with the same email.
      resolve(foundPersons[0]);
    } else {
      // Check DB for person
      this.firestore.collection("persons")
      .where('email','==', email)
      .get()
      .then((querySnapshot) => {
        // NOTE: this will silently fail if there are multiple people with the same email.
        querySnapshot.forEach((doc) => {
          console.log("querysnapshot to person");
          var person = new Person(doc.id, doc.data().name);
          person.email = email;
          resolve(person);
        });
        resolve(undefined);
      });
    }
  });
    return p;
  }

  getPersonByID(id) {
    /**
     * Gets the person with an id
     * @param id {string} id to search by
     * @return {Promise} promise for a {Person}
     *          with the given id. Null if person doesn't exist locally or in DB
     */
    // Check local first
    let p = new Promise(
       (resolve, reject) => {
          var foundPersons  = Array.from(this._persons).filter(obj => obj[1].id === id).map(obj=>obj[1])
          if (foundPersons.length > 0) {
            resolve(foundPersons[0]);
          } else {
            // Check DB for person
            this.firestore.collection("persons").doc(id).get()
            .then((doc)=>{
              if(doc.exists) {
                resolve(new Person(doc.id, doc.data().name));
              } else {
                resolve(undefined);
              }
            });
          }
      });
    return p;
  }

  getAllPersons(){
    /**
     * Gets all the Persons in the Datastore
     * @return {Promise} promise for a {Person Array} of all Persons
     */
     let p = new Promise(
      (resolve, reject) => {
     var personsList = [];
      this._persons.forEach((value,key,map)=>{
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
        this._tags.forEach((value,key,map)=>{
          var val = value;
          val["id"] = key;
          tagList.push(val);
        });
        resolve(tagList);
      });
    return p;
  }

  getAllLabels(){
    let p = new Promise(
      (resolve, reject) => {
        var arr = Array.from(this._labels);
        resolve(arr);
    })
    return p;
  }

  getTagsBySubject(id){
    /**
     * Gets all the Tags with a specific subject
     * @param id {String} the uuid of the subject of a tag to search by
     * @return {Promise} promise for a {Tag Array} of Tags
     *          with the given subject
     */
    return Promise.resolve(Array.from(this._tags).filter(obj => obj[1].subject === id).map(obj => obj[1]));
  }


  /* test code */
  setPersonCollection(collection) {
    this._personCollection = collection;
  }

  setTagCollection(collection) {
    this._tagCollection = collection;
  }


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
    return this._personDiffs.size;
  }

  numTagDiffs() {
    return this._tagDiffs.size;
  }

  resetDiffs() {
    this._personDiffs = new Map();
  }

  numPersons() {
    return this._persons.size;
  }

  numTags() {
    return this._tags.size;
  }

  numData() {
    return this._data.length;
  }

  /* end test code */


}

export default new DataStore();