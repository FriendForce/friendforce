import styles from './TagEntrySearch.less';
import React, { Component } from 'react';
import Entry from './components/Entry/Entry.js';
import Tags from './components/Tags/Tags.js';
import data from './infos';
import people from './people';
import edges from './edges';
// TODO need to pass getter and setter functions

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
    this.setState({ people: this.state.people.concat(person)});
    console.log('updated people');
  };

  addEdge = edge => {
    this.setState({ edges: this.state.edges.concat(edge)});
    console.log('updated edges');
  };

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
