
//Remove these when we're done with constant data

//import persons from './ConstData/persons.js';
//import tags from './ConstData/tags.js';
import firebaseStyleTags from './ConstData/firebaseStyleTags.js';
import firebaseStylePersons from './ConstData/firebaseStylePersons.js';
import firebaseConfig from './ConstData/firebase_config.js';
import firebase from 'firebase';
import 'firebase/firestore';



class DataStore {
  constructor(){
     // TODO: Change what gets loaded 
     this._data = [];
     this.MAX_TAG_DIFFS = 15;
     this.MAX_PERSON_DIFFS = 10;
     // Collection names changable so you can do some test dicking around
     this._personCollection = "persons";
     this._tagCollection = "tags";
     firebase.initializeApp(firebaseConfig);
     this.firestore = firebase.firestore();
     const settings = {timestampsInSnapshots: true};
     this.firestore.settings(settings);
     this._tagDiffs = new Map();
     this._personDiffs = new Map();
     this._labelList = [];
     this._persons = new Map();
     this._tags = new Map();
     this._labels = new Set([]);
     //this.loadExternalPersons(persons);
     //this.loadExternalTags(tags);
  }

  saveState() {
    localStorage.dataStoreTags = JSON.stringify(Array.from(this._tags.entries()));
    localStorage.dataStorePersons = JSON.stringify(Array.from(this._persons.entries()));
    localStorage.dataStorePersonDiffs = JSON.stringify(Array.from(this._personDiffs.entries()));
    localStorage.dataStoreTagDiffs = JSON.stringify(Array.from(this._tagDiffs.entries()));
    localStorage.dataStoreLabels = JSON.stringify(Array.from(this._labels));
  }

  loadState() {
    if(typeof localStorage.dataStoreTags !== 'undefined') {
      this._tags = new Map(JSON.parse(localStorage.dataStoreTags));
    }
    if(typeof localStorage.dataStorePersons !== 'undefined') {
      this._persons = new Map(JSON.parse(localStorage.dataStorePersons));
    }
    if(typeof localStorage.dataStoreTagDiffs !== 'undefined') {
      this._tagDiffs = new Map(JSON.parse(localStorage.dataStoreTagDiffs));
    }
    if(typeof localStorage.dataStorePersonDiffs !== 'undefined') {
      this._personDiffs = new Map(JSON.parse(localStorage.dataStorePersonDiffs));
    }
    if(typeof localStorage.dataStoreLabels !== 'undefined') {
      this._labels = new Set(JSON.parse(localStorage.dataStoreLabels));
    }
    
  }

  _nameToId(name) {
    return name.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
  } 

  _tagToId(tag) {
    return tag.label.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 20);
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
    firestorePerson.set(stagedfirestorePerson, {merge:true})
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
    firestoreTag.set(stagedfirestoreTag, {merge:true})
    .then(function(){})
    .catch(function(error){console.log("caught error pushing tag" + error)});
    return id;
  }

  firebasePushLabels() {
    var stagedLabels = {};
    this._labels.forEach(label=>stagedLabels[label]=true);
    var firestoreLabels = this.firestore.collection("labels").doc("labels");
    firestoreLabels.set(stagedLabels, {merge:true})
    .then(function(){})
    .catch(function(error){console.log("caught error adding lables" + error)});
  }

  firebasePull(userId) {
    /**
     * Pulls data from firebase
     * @Param userId {string -> id} id of the user pushing the data
     */
    // Grab all the data you're allowed to get from firebase
    //Get all people known by the user
    // TODO make this totally Async
    var p = new Promise((resolve, reject) => {
     this.firestore.collection("persons")
      .where("knownByPersons."+ userId, "==", true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // Do things with doc.id and doc.data()
          var newPerson = doc.data();
          newPerson.id = doc.id;
          this._persons.set(doc.id, newPerson);
        });
      })
      .then(() => {
        this.firestore.collection("tags")
        .where("originator", "==", userId)
        .where("publicity", "==", "private")
        .get()
        .then((querySnapshot)=>{
          querySnapshot.forEach((doc)=>{
            var newTag = doc.data();
            newTag.id = doc.id;
            this._tags.set(doc.id, newTag);
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
              this._tags.set(doc.id, newTag);
            });
          })
        })
        .then(()=>{
          this.firestore.collection("labels").doc("labels")
          .get()
          .then((doc)=>{
            Object.keys(doc.data()).forEach((label)=>
              {this._labels.add(label)}
            );
            console.log(this._labels);
          })
          resolve(true);
        })
      })
      .catch(function(error) {
        console.log("Error in firebasePull: ", error);
      });
    });
    return p;  
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
    localStorage.dataStorePersonDiffs = JSON.stringify(Array.from(this._personDiffs.entries()));
    localStorage.dataStoreTagDiffs = JSON.stringify(Array.from(this._tagDiffs.entries()));
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
      return obj[1].name === person.name;

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

  addPersonByName(name, userId, dontSync=false) {
    /** Creates a person by name and adds them to the Datastore. This 
     * will always create a new person - caller needs to check if person
     * already exists.
     * @param person {string Name} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
     // TODO: check whether person exists in firestore
     // NEXT TODO: make addPerson, addTag use _persons 
     var id = this._nameToId(name);
     var person = {
        id:id,
        name:name
      };
      // Check whether you're repeating a person
      const duplicate = this.checkPersonForDuplicate(person);
      if(duplicate) {
        // update data
        // If the new person has a tag 
        return Promise.resolve(duplicate);
      }
      this._persons.set(id, person);
      
      if (!dontSync) {
        this.firebasePushPerson(person, userId, id);
      } else {
        this._personDiffs.set(id, person);
      }
     return Promise.resolve(id);
  }

  addPerson(person){
    /**
     * Adds a person object to the Datastore
     * @param person {Person} with populated fields
     * @return {Promise} promise resolves when person successfully added
     */
    return Promise.resolve(this._persons.set(person.id, person));
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
     var tag = {
      id:'',
      subject:subject,
      label:label,
      publicity:publicity,
      originator:originator,
     }
     this._labels.add(tag.label);

     tag = this.additionalTagLogic(tag);
     console.log(tag);
     tag.id = this._tagToId(tag);
     this._tags.set(tag.id, tag);
     
     if (!dontSync) {
      this.firebasePushTag(tag, tag.id);
     } else {
       this._tagDiffs.set(tag.id, tag);
     }
     return Promise.resolve(tag.id);
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
    return Promise.resolve(Array.from(this._persons).filter(obj => obj[1].name === name).map(obj=>obj[1]));
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