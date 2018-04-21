import React, { Component } from 'react';
import './App.css';
import persons from './ConstData/persons.js';
import tags from './ConstData/tags.js';
import Omnibox from './Omnibox/Omnibox.jsx';
import PersonBox from './Person/Person.jsx';
import SearchBox from './Search/Search.jsx';
import Home from './Home/Home.js';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from 'react-router-dom'



const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route exact path={match.path} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </div>
)

class App extends Component {
  constructor(props) {
    super(props);

    // *** Initialize Firebase
    /*
    var config = {
      apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
      authDomain: "friendforce-25851.firebaseapp.com",
      databaseURL: "https://friendforce-25851.firebaseio.com",
      projectId: "friendforce-25851",
      storageBucket: "friendforce-25851.appspot.com",
    };
    firebase.initializeApp(config);
  */
    this.state = { 
    };
    this.addThing = this.addThing.bind(this);
    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
  }

  addThing = thing => {
    console.log('adding thing: ' + thing);
  }

  setPerson = person => {
    console.log('set person: ' + person.name);
    this.props.history.push('/person/'+person.id);
  }

  setTag = tag => {
    console.log('set tag: ' + tag.label);
    this.props.history.push('/search/'+tag.id);
  }


  render () {
    return (
      <div>
        <div id="firebaseui-auth-container"></div>
        <Omnibox 
          persons={persons} 
          tags={tags}
          addThing={this.addThing}
          setPerson={this.setPerson}
          setTag={this.setTag} 
        />

      </div>
    )
  }
}

const AppWithRouter = withRouter(App);

const BasicExample = () => (
  <Router>
    <div>
      <AppWithRouter/>
      <hr/>
        <Route exact path="/" component={Home}/>
        <Route path="/topics" component={Topics}/>
        <Route path="/person" component={PersonBox}/>
        <Route path="/search" component={SearchBox}/>
    </div>
  </Router>
)
export default BasicExample