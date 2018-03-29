import styles from './TagEntrySearch.less';
import React, { Component } from 'react';
import Entry from './components/Entry/Entry.js';
import Tags from './components/Tags/Tags.js';
import data from './infos';
import people from './people';
import edges from './edges';

// TODO need to pass getter and setter functions
export const uuid = foo => {
  // Get a random uuid
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

const peopleArrayToPeopleMap = (people_array) => {
  var people_map = new Map();
  people_array.forEach(person => {
    people_map.set(person.id, {
      subject: person.subject,
      originator: person.originator,
      tag: person.tag,
      timestamp: person.timestamp
    });
  })
  return people_map;
}

const peopleMapToPeopleArray = (people_map) => {
  var people_array = []
  people_map.forEach((value, key)=>{
    var person = people_map.get(key);
    person['id'] = key;
    people_array.push(person);
  });
  return people_array;
}

const createEdge = (subject, originator, tag, timestamp) => {
    var edge = {
        id: uuid(),
        subject: subject,
        originator: originator,
        tag: tag,
        timestamp: timestamp
      };
    return edge;
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
      },
      user_id: '0'
    };
    this.addInfo = this.addInfo.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addEdge = this.addEdge.bind(this);
  }

  componentWillMount = db => {
    this.setState({user_id: this.props.user_id})
  }

   componentWillReceiveProps = new_props => {
    this.setState({user_id: new_props.user_id});
  };

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
<<<<<<< HEAD
=======
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
>>>>>>> origin/master


    // First, get all edges that you're allowed to get.
    // Second, get all people who are related to the edges that you're
    // allowed to get
    db.collection("edges").where("originator", "==", this.state.user.id)
      .get()
      .then((querySnapshot) => {
        var new_edges = this.state.edges
        querySnapshot.forEach(function(doc) {
          function findDuplicateEdge(edge, doc) {
            return edge.id = doc.id || (edge.originator == doc.data().originator &&
                         edge.subject == doc.data().subject &&
                         edge.tag == doc.data().tag);
          } 
          var matches = new_edges.findIndex(edge => { return findDuplicateEdge(edge, doc); });
          if (matches.length == 1) {
            matches.forEach(match => {
              new_edges[match] = {
                id: doc.id,
                originator: doc.data().originator,
                subject: doc.data().subject,
                timestamp: doc.data().timestamp,
                tag: doc.data().tag
              }
            });
          } else if (matches.length > 1) {
            console.log("error: multiple matches for same edge");
            // need to de dup edges here
          } else {
            // add new nedge
            new_edges.push(
              {
                id: doc.id,
                originator: doc.data().originator,
                subject: doc.data().subject,
                timestamp: doc.data().timestamp,
                tag: doc.data().tag
            });
          }
        });
        this.setState({edges: new_edges});
        return new_edges;
      })
      .then((new_edges) => {
        var subject_ids = new_edges.map(edge => edge.subject);
        // you get to tag yourself too
        subject_ids.push(this.state.user_id);
        subject_ids = new Set(subject_ids);
        var new_people_map = peopleArrayToPeopleMap(this.state.people);
        var promises = [];
        subject_ids.forEach(id => {
          var promise = db.collection("people").doc(id).get();
          promises.push(promise);
        });
        Promise.all(promises)
          .then((docs) => {
            docs.forEach((doc) => {
              var data = doc.data();
              new_people_map.set(doc.id, doc.data());
            });
            
            var new_array = peopleMapToPeopleArray(new_people_map);
            this.setState({people:new_array});
          });
      });
  }


  saveToDB = db => {
    // create a person for each person in the people list
    //This line will become irrelevant once start sing data correctly
    console.log("saving");
    var that = this;
    db = this.props.db;
    // Save People
    for (var i = 0; i < this.state.people.length; i++) {
      var person = this.state.people[i];
      // Check if a person with duplicate info exists
      // this will be a complicated flow eventually
      // email, nicknames, etc, maybe feedback
      // for now just check names
      function personQueryResponse(querySnapshot, i, that, person) {
        if (querySnapshot.size == 0) {
            //create a new person
            var db_person = db.collection("people").doc(person.id).set({
              name : person.name})
            .then(function() {
              console.log(person.name + "written!");
            })
            .catch(function(error) {
              console.error("Error writing document: ", error);
            });
          } else if (querySnapshot.size == 1) {
            querySnapshot.forEach(doc => {
              // Update all the edges
              if (doc) {
                var new_edges = that.state.edges.map(edge => {
                  var temp_edge = edge;
                  if (edge.originator == person.id) {
                    temp_edge.originator = doc.id;
                  }
                  if (edge.subject == person.id) {
                    temp_edge.subject = doc.id;
                  }
                  return temp_edge;
                });
                that.setState({edges: new_edges});
                var new_people = that.state.people;
                // TODO: how do you pass this i into the async function
                if (i < new_people.length) {
                  new_people[i].id = doc.id;
                } else {
                  console.log("error: i = " + i + "new people = " + new_people.length);
                }
                that.setState({people: new_people});
              } else {
                console.log("error no doc");
              }
            }); 
          } else {
            console.log("ERP MULTIPLE PEOPLE WITH SAME NAME");
            console.log("querySnapshot size = " + querySnapshot.size);
            querySnapshot.forEach(doc => {
              console.log(doc.data());
            });
          }
      }
      const i2 = i;
      const that2 = that;
      const person2 = person;
      db.collection("people").where("name", "==", person.name)
        .get()
                // TODO - get this working - right now doesn't call 
        .then( function(querySnapshot) {
          return personQueryResponse(querySnapshot, i2, that2, person2) 
        });
      
    }
    // Save Edges
    this.state.edges.forEach((edge) => {
      function edgeQueryResponse(querySnapshot, j, that) {
        if (querySnapshot.size == 0) {
            //create a new person
            var db_edge = db.collection("edges").doc(edge.id);
            db_edge.set({
              originator : edge.originator,
              subject : edge.subject,
              tag : edge.tag,
              timestamp : edge.timestamp
            }, {merge: true});
          } else if (querySnapshot.size == 1) {
            querySnapshot.forEach(doc => {
              // Update the local edge id
              var new_edges = that.state.edges;
              new_edges[j].id = doc.id;
              that.setState({edges: new_edges});
            }); 
          } else {
            console.log("ERP MULTIPLE PEOPLE WITH SAME NAME");
            console.log("querySnapshot size = " + querySnapshot.size);
            querySnapshot.forEach(doc => {
              console.log(doc.data());
            });
          }
      }
      const i2 = i;
      const that2 = that;
      db.collection("edges")
        .where("originator", "==", edge.originator)
        .where("subject", "==", edge.subject)
        .where("tag", "==", edge.tag)
        .get()
        // TODO - get this working
        .then(function(querySnapshot) {
          return edgeQueryResponse(querySnapshot, i2, that2)
        });
    }
  });

  uploadFBData = files => {
    var fr = new FileReader();
    fr.onload = e => {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(e.target.result, "text/html");
      var friend_html = htmlDoc.body.children[1].children[2].children;
      for (var i = 0; i < friend_html.length; i++) {
        // TODO: need to handle corner case where person has >2 names
        
        var name = friend_html[i].innerText.split(" (")[0];
        
        // Create a person for each person
        var person = {
          name: name,
          id: uuid()
        };
        // TODO: obviously need to check for duplicates
        this.addPerson(person);
        this.addEdge(
          createEdge(
            person.id,
            this.state.user.id,
            "fb friend",
            Date.toString()
          )
        );
      }
    } 
    fr.readAsText(files[0]);
    console.log("done uploading fb data!");
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
        <div>
        Upload Facebook Data: 
        <input type="file" id="files" name="files[]" multiple onChange={(e) => this.uploadFBData(e.target.files)} />  
        </div>

      </div>
    );
  }
}
