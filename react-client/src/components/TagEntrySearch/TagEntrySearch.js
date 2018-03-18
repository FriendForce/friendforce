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
    console.log('updated Info');
  };


  addPerson = person => {
    //TODO - weird bug where it doesn't push a person until a new person
    // is entered
    var temp_array = this.state.people.slice();
    temp_array.push(person);
    this.setState({ people: temp_array });
    console.log('updated people');
  };

  addEdge = edge => {
    var temp_array = this.state.edges.slice();
    temp_array.push(edge);
    this.setState({ edges: temp_array });
    console.log('updated edges');
  };


  testDB = db => {
    db.collection("people").where("Name", "==", "Benjamin Reinhardt")
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  };

  componentWillMount = value => {
    //this.testDB(this.props.db);
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
    db = this.props.db;
    
    console.log("loading!");
  };

  saveToDB = db => {
    // create a person for each person in the people list
    //This line will become irrelevant once start sing data correctly
    db = this.props.db;
    console.log(this.state.data);
    var lists = infosToLists(this.state.data);
    var tag_array = lists['tag_array'];
    var people_array = lists['people_array'];
    //todo, need to get originators out of people array
    var temp_people = [];
    for (var i = 0; i < people_array.length; i++) {
      // create id
      var id = uuid();
      var name = people_array[i];
      temp_people.push({id:id, name:name});
    }
    this.setState({people: temp_people});
    var temp_edges = this.state.data;
    for (var i = 0; i < temp_edges.length; i++) {
      // replace edge names with ids 
      var temp_edge = temp_edges[i];
      var originator = temp_people.filter(person => person.name === temp_edge.originator);
      var subject = temp_people.filter(person => person.name === temp_edge.subject);
      temp_edge.originator = originator[0].id;
      temp_edge.subject = subject[0].id;
      temp_edges[i] = temp_edge;
    }
    // TODO: why isn't the state updating?
    this.setState({edges: temp_edges});
    // iterate through every in the infos 
    
    console.log("saving! State = ");
    console.log(this.state);
   
    for (var i = 0; i < temp_people.length; i++) {
      var person = db.collection("people").doc(temp_people[i].id);
      person.set({
        name : temp_people[i].name,
      }, {merge: true});
    }
    for (var i = 0; i < temp_edges.length; i++) {
      id = uuid();
      var edge = db.collection("edges").doc(id);
      edge.set({
        subject : temp_edges[i].subject,
        originator : temp_edges[i].originator,
        timestamp : temp_edges[i].timestamp,
        tag : temp_edges[i].tag,
      }, {merge : true});
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
      </div>
    );
  }
}
