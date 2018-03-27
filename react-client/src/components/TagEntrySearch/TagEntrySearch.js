import styles from './TagEntrySearch.less';
import React, { Component } from 'react';
import Entry from './components/Entry/Entry.js';
import Tags from './components/Tags/Tags.js';
import data from './infos';
import people from './people';
import edges from './edges';
// TODO need to pass getter and setter functions

const uuid = foo => {
  // Get a random uuid
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

Set.prototype.union = function(setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
}

const infosToLists = infos => {
  // Turn the list of infos into a list of tags
  var tags = infos.map(x => x.tag);
  var tag_array = Array.from(new Set(tags));

  // Turn the list of infos into a list of people
  let subjects = new Set(infos.map(x => x.subject));
  let originators = new Set(infos.map( x=> x.originator));

  var people_array = Array.from(subjects.union(originators));
  return { tag_array: tag_array, people_array: people_array };
};

export default class TagEntrySearch extends Component {
  constructor() {
    super();
    this.state = {
      data: data,
      edges: edges,
      people: people,
      current_person: {},
      user: {
        id: '4',
        name: 'Trinity'
      }
    };
    this.addInfo = this.addInfo.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addEdge = this.addEdge.bind(this);
  }

  addInfo = info => {
    var temp_array = this.state.data.slice();
    temp_array.push(info);
    this.setState({ data: temp_array });
  };

  addPerson = person => {
    this.setState({ people: this.state.people.concat(person)});
  };

  addEdge = edge => {
    this.setState({ edges: this.state.edges.concat(edge)});
  };

  deleteDB = db => {
    db = this.props.db;
    db.collection("people").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        db.collection("people").doc(doc.id).delete();
      });
    });

    db.collection("edges").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        db.collection("edges").doc(doc.id).delete();
      });
    });
  };

  loadFromDB = db => {
    // loads everything from the db
    //overwrite data right now
    var people = [];
    db = this.props.db;
    // TODO - why doesn't this work?
    db.collection("people").get().then((querySnapshot) => {
      querySnapshot.forEach(function(doc) {
        var data = doc.data();
        var person = {
          id: doc.id,
          name: data.name
        }
        people.push(person);
      });
      this.setState({people:people});
    });

    var edges = [];
    db.collection("edges").get().then((querySnapshot) => {
      querySnapshot.forEach(function(doc) {
        var data = doc.data();
        var edge = {
          id: doc.id,
          originator: data.originator,
          subject: data.subject,
          timestamp: data.timestamp,
          tag: data.tag
        }
        edges.push(edge);
      });
      this.setState({edges:edges});
    });    
  }


  saveToDB = db => {
    // create a person for each person in the people list
    //This line will become irrelevant once start sing data correctly
    db = this.props.db;
    // Save People
    for (var i = 0; i < this.state.people.length; i++) {
      var person = this.state.people[i];
      var db_person = db.collection("people").doc(person.id);
      db_person.set({
        name : person.name,
      }, {merge: true});
    }
    // Save Edges
    for (var i = 0; i < this.state.edges.length; i++) {
      var edge = this.state.edges[i];
      var db_edge = db.collection("edges").doc(edge.id);
      db_edge.set({
        subject : edge.subject,
        originator : edge.originator,
        timestamp : edge.timestamp,
        tag : edge.tag,
      }, {merge : true});
    }
  }

  render() {
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Examples</h2>
        <Tags
          infos={this.state.data}
          people={this.state.people}
          edges={this.state.edges}
          addInfo={this.addInfo}
          addPerson={this.addPerson}
          addEdge={this.addEdge}
        />
        <Entry
          infos={this.state.data}
          people={this.state.people}
          edges={this.state.edges}
          user={this.state.user}
          addInfo={this.addInfo}
          addPerson={this.addPerson}
          addEdge={this.addEdge}
        />
        <button onClick={this.loadFromDB}>Load Data</button>
        <button onClick={this.saveToDB}>Save Data</button>
        <button onClick={this.deleteDB}>Delete DB</button>  


      </div>
    );
  }
}
