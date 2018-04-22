import React, { Component } from 'react';
import './App.css';
import Omnibox from './Omnibox/Omnibox.jsx';
import Person from './Person/Person.jsx';
import Search from './Search/Search.jsx';
import Home from './Home/Home.js';
import DataStore from './DataStore.jsx';

import {
  BrowserRouter as Router,
  Route,
  withRouter,
} from 'react-router-dom'


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
      tags:[],
      persons:[],
      user:'default'
    };
    DataStore.getAllTags()
    .then((tags) =>{
      this.setState({tags});
    });
    DataStore.getAllPersons()
    .then((persons) =>{
      this.setState({persons:persons});
    });
    this.addThing = this.addThing.bind(this);
    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
  }

  addThing = thing => {
    // If you are in person mode the new thing will be a tag
    // If you are in search mode you can't add new things
    // If you are in home mode a new thing is a person
    var path = this.props.location.pathname.split("/");
    if (path[1] === ""){
      DataStore.addPersonByName(thing)
      .then((id)=>{
        this.props.history.push('/person/'+id);
        DataStore.getAllPersons()
        .then((persons) =>{
          this.setState({persons:persons});
        });
      });
    } else if (path[1] === "person") {
      var subject = path[2];
      var originator = this.state.user;
      DataStore.addTag(subject, thing, originator)
      .then((id)=>{
        DataStore.getAllTags()
        .then((tags) =>{
          this.setState({tags:tags});
        });
      });
      console.log("creating and adding tag " + thing + " to " + path[2]);
    } 
  }

  setPerson = person => {
    console.log('set person: ' + person.name);
    this.props.history.push('/person/'+person.id);
  }

  setTag = tag => {
    //If you are in person mode add that tag to a person
    //If you are in home mode start searching
    //If you are in search mode add that tag to the search
    var path = this.props.location.pathname.split("/");
    if (path[1] === ""){
      this.props.history.push('/search/'+tag.id);
    } else if (path[1]==="person") {
      // Add Tag to person
      console.log("adding " + tag.label + " to " + path[2]);
    } else if (path[1]==="search") {
      if (path.length === 2 || path[2] === "") {
        var prettySlash = '/';
        if (this.props.location.pathname.slice(-1)===prettySlash) {
          prettySlash="";
        }
        this.props.history.push(this.props.location.pathname+ prettySlash + tag.label.replace(/[^A-Z0-9]/ig, "_"));
      } else if (path.length === 3) {
        this.props.history.push(this.props.location.pathname+"+"+tag.label.replace(/[^A-Z0-9]/ig, "_"));
      }      
    }
  }


  render () {
    return (
      <div>
        <div id="firebaseui-auth-container"></div>
        <Omnibox 
          persons={this.state.persons} 
          tags={this.state.tags}
          addThing={this.addThing}
          setPerson={this.setPerson}
          setTag={this.setTag} 
        />
        <Route exact path="/" component={Home}/>
        <Route path="/person/:personId" 
               render={(props)=><Person {...props.match.params} 
                                 tags={this.state.tags}
                                 persons={this.state.persons}/>}/>
        <Route path="/search/:searchString" 
               render={(props)=><Search {...props.match.params} 
                                 tags={this.state.tags}
                                 persons={this.state.persons}/>}/>
      </div>
    )
  }
}

const AppBox = withRouter(App);

const FullApp = () => (
  <Router>
    <div>
      <AppBox/>
    </div>
  </Router>
)
export default FullApp