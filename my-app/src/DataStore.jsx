
//Remove these when we're done with constant data

import Person from './Types/Person';
import Tag from './Types/Tag';

import firebaseStyleTags from './ConstData/firebaseStyleTags.js';
import firebaseStylePersons from './ConstData/firebaseStylePersons.js';

import firebase from './firebase';


class DataStore {
  constructor(){
     // TODO: Change what gets loaded 
     this._data = [];
     this.MAX_TAG_DIFFS = 15;
     this.MAX_PERSON_DIFFS = 10;
     // Collection names changable so you can do some test dicking around
     this._personCollection = "persons";
     this._tagCollection = "tags";

     this.firestore = firebase.firestore();

     this._tagDiffs = new Map();
     this._personDiffs = new Map();
     this._labelList = [];
     this._persons = new Map();
     this._tags = new Map();
     this._labels = new Set([]);
     //this.loadExternalPersons(persons);
     //this.loadExternalTags(tags);
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
    return this.firestore.collection("_admin").doc("env/envs/"+env).get();
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

  // TODO: ben, remove the id
  firebasePushPerson(person, userId, id) {
     /**
     * Pushes a single person to firebase
     * @Param person {Person} person to push
     * @Param userId {string -> id} id of the current user
     * @Param id {string -> id} id of the person
     */
    // create storage 
    if (typeof id === "undefined") {
      return id;
    }
    var stagedfirestorePerson = person;
    stagedfirestorePerson.timestamp = new Date(Date.now());
    delete stagedfirestorePerson.id;
    stagedfirestorePerson.knownByPersons = {};
    stagedfirestorePerson.knownByPersons[userId] = true;
    console.log(id + " " + userId);
    var firestorePerson = this.firestore.collection("persons").doc(id);
    firestorePerson.set(Object.assign({}, stagedfirestorePerson), {merge:true})
    .then(function(){console.log("set person")})
    .catch(function(error){console.log("caught error " + error)});

    var firestoreUser = this.firestore.collection("persons").doc(userId);
    var updatedData = {knownPersons:{}};
    updatedData.knownPersons[id] = true;
    console.log(updatedData);
    firestoreUser.set(updatedData, {merge:true})
      .then(function(){console.log("set user")})
      .catch(function(error){console.log("caught error " + error)});
    return id;
  }

  firebasePushTag(tag, id) {
     /**
     * Pushes a single tag to firebase
     * @Param tag {Tag} tag to push
     * @Param id {string -> id} id of the tag
     */
    var stagedfirestoreTag = tag;
    stagedfirestoreTag.timestamp = new Date(Date.now());
    delete stagedfirestoreTag.id;
    if (typeof stagedfirestoreTag.type === 'undefined') {
      delete stagedfirestoreTag.type;
    }
    var firestoreTag = this.firestore.collection("tags").doc(id);
    firestoreTag.set(Object.assign({}, stagedfirestoreTag), {merge:true})
    .then(function(){})
    .catch(function(error){console.log("caught error pushing tag" + error)});
    return id;
  }

  firebaseDeleteTag(id) {
    this.firestore.collection("tags").doc(id).delete()
    .then(()=>{console.log("tag " + id + "successfully deleted");});
  }

  firebasePushLabels() {
    var stagedLabels = {};
    this._labels.forEach(label=>stagedLabels[label]=true);
    var firestoreLabels = this.firestore.collection("labels").doc("labels");
    firestoreLabels.set(stagedLabels, {merge:true})
    .then(function(){})
    .catch(function(error){console.log("caught error adding lables" + error)});
  }

registerFirebaseListener(userId, callback) {
    /**
     * Sets up a listener to firebase
     * @Param userId {string -> id} id of the user pushing the data
     * @Param callback - function to call when resolved
     */
     // TODO: Modify to react differently to snapshot.docChanges()

     this.firestore.collection("persons")
     .where("knownByPersons."+ userId, "==", true)
     .onSnapshot({/*config object*/}, (querySnapshot)=> {
        this._persons = new Map();
        querySnapshot.forEach((doc) => {
          // Do things with doc.id and doc.data()
          var newPerson = doc.data();
          newPerson.id = doc.id;
          this._persons.set(doc.id, newPerson);
        });
        console.log("persons pull :", querySnapshot.size);
        callback();
     })

     this.firestore.collection("tags")
     .where("originator", "==", userId)
     .where("publicity", "==", "private")
     .onSnapshot({/*config object*/}, (querySnapshot)=> {
        querySnapshot.forEach((doc)=>{
          var newTag = doc.data();
          newTag.id = doc.id;
          this._tags.set(doc.id, newTag);
        });
        console.log("ptag pull1 :", querySnapshot.size);
        callback();
      })

      this.firestore.collection("tags")
      .where("publicity", "==", "public")
      .onSnapshot({/*config object*/}, (querySnapshot)=> {
        querySnapshot.forEach((doc)=>{
          var newTag = doc.data();
          newTag.id = doc.id;
          this._tags.set(doc.id, newTag);
        });
        console.log("ptag pull2 :", querySnapshot.size);
        callback();
      })

      this.firestore.collection("labels")
      .onSnapshot({/*config object*/}, (querySnapshot)=> {
        querySnapshot.forEach((doc)=>{
          if (doc.data().label !== null) {
            this._labels.add(doc.data().label);
          }
        });
        console.log("label pull :", querySnapshot.size);
        callback();
      })
  }

  firebasePush(userId) {
    /**
     * Pushes Tags and Persons to firestore and clears diffs
     * @Param userId {string -> id} id of the user pushing the data
     */
    this._personDiffs.forEach((person, id)=>{this.firebasePushPerson(person, userId, id);});
    this._tagDiffs.forEach((tag, id)=>{this.firebasePushTag(tag, id)});
    this._personDiffs = new Map();
    this._tagDiffs = new Map();
    if (window && 'localStorage' in window) {
      localStorage.dataStorePersonDiffs = JSON.stringify(Array.from(this._personDiffs.entries()));
      localStorage.dataStoreTagDiffs = JSON.stringify(Array.from(this._tagDiffs.entries()));
    }
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
      var id = this._nameToId(name);
      if (creatorUserId.length === 0) {
        creatorUserId = id;
      }
      var person = new Person(id, name);
      if (email.length > 0) {
        person.email = email;
      }
      // Check whether you're repeating a person
      const duplicate = this.checkPersonForDuplicate(person);
      if(duplicate) {
        // update data
        // If the new person has a tag 
        return Promise.resolve(duplicate);
      }
      this._persons.set(id, person);
      
      if (!dontSync) {
        this.firebasePushPerson(person, creatorUserId, id);
      } else {
        this._personDiffs.set(id, person);
      }
     return Promise.resolve(id);
  }

  addPerson(person, creatorUserId, dontSync=false){
    /**
     * Adds a person object to the Datastore
     * @param person {Person} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
    if (!dontSync) {
        this.firebasePushPerson(person, creatorUserId, person.id);
      } else {
        this._personDiffs.set(person.id, person);
      }
    return Promise.resolve(true);
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
     var tag = new Tag(null, subject, originator, label, null, publicity);
     this._labels.add(tag.label);

     // tag = this.additionalTagLogic(tag);
     tag.id = this._tagToId(tag);
     this._tags.set(tag.id, tag);
     
     if (!dontSync) {
      this.firebasePushTag(tag, tag.id);
      this.firestore.collection("labels")
      .doc(this._labelToId(tag.label))
      .set({label:tag.label}, {merge:true});
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
     this._tags.delete(id);
     // remove from DB
     this.firebaseDeleteTag(id);
     
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
      this.firebasePushTag(tag, tag.id);
      this.firestore.collection("labels")
      .doc(this._labelToId(tag.label))
      .set({label:tag.label}, {merge:true});
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
