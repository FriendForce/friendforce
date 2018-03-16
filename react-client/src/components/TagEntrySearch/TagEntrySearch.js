
import React, { Component } from 'react';
import Entry from './components/Entry/Entry.js';
import Tags from './components/Tags/Tags.js';
import data from './infos';
// TODO need to pass getter and setter functions

export default class TagEntrySearch extends Component {
  constructor() {
    super();
    this.state = {
      data: data
    };
    this.addInfo = this.addInfo.bind(this);
  }

  addInfo = info => {
    var temp_array = this.state.data.slice();
    temp_array.push(info);
    this.setState({ data: temp_array });
    console.log('updated Info');
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
    this.testDB(this.props.db);
  };

  loadFromDB = db => {

  };

  saveToDB = db => {

  };

  render() {
    return (
      <div>
        <h2 >Examples</h2>
        <Tags infos={this.state.data} addInfo={this.addInfo} />
        <Entry infos={this.state.data} addInfo={this.addInfo} />
      </div>
    );
  }
}
