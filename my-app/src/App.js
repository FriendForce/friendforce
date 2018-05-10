import React, { Component } from 'react';
import './App.css';
import Omnibox from './Omnibox/Omnibox.jsx';
import Person from './Person/Person.jsx';
import Search from './Search/Search.jsx';
import Home from './Home/Home.js';
import DataStore from './DataStore.jsx';
import AddBox from './AddBox/AddBox.jsx';
import { Container, Row, Col } from 'reactstrap';
import {
  BrowserRouter as Router,
  Route,
  withRouter,
} from 'react-router-dom'

const getSearchLabels =(searchString) => {
  var labels = searchString.split("+");
  const formattedLabels = labels.map(label => label.replace("%", " "))
  return formattedLabels;
}

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
      console.log('persons', persons)
      this.setState({persons:persons});
    });
    this.addThing = this.addThing.bind(this);
    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addTagToPerson = this.addTagToPerson.bind(this);
  }

  addPerson = name => {
    DataStore.addPersonByName(name)
      .then((id)=>{
        this.props.history.push('/person/'+id);
        DataStore.getAllPersons()
        .then((persons) =>{
          this.setState({persons:persons});
        });
      });
  }

  addTagToPerson = label => {
    var subject = this.props.match.params.data;
    var originator = this.state.user;
    DataStore.addTag(subject, label, originator)
    .then((id)=>{
      DataStore.getAllTags()
      .then((tags) =>{
        this.setState({tags:tags});
      });
    });
    console.log("creating and adding tag " + label + " to " + subject);
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
    if (this.props.match.params.mode === "search" && this.props.match.params.data.length > 0) {
      this.props.history.push(this.props.location.pathname+"+"+tag.label.replace(/[^A-Z0-9]/ig, "_"));
    } else {
      this.props.history.push('/search/'+tag.label);
    }
  }


  render () {

    var searchLabels = [];
    if (this.props.match.params.mode === "search" && this.props.match.params.data) {
      searchLabels = getSearchLabels(this.props.match.params.data);
    } 
    console.log('this.props.match.params', this.props.match)
    return (
      <div>
        <div id="firebaseui-auth-container"></div>
        <Container>
        <Row>
        <Col>
          <Omnibox
            mode = {this.props.match.params.mode} 
            searchLabels = {searchLabels}
            searchString={this.props.match.params}
            persons={this.state.persons} 
            tags={this.state.tags}
            // addPerson={this.addPerson}
            // addThing={this.addThing}
            setPerson={this.setPerson}
            setTag={this.setTag} 
            placeholder="Search a name or a tag"
          />
        </Col>
        
        <Col>
          <Route exact path="/" component={Home}/>
          {/* <Route path="/person/:personId" 
                 render={(props)=><Person {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}/>}/> */}
          <Route path="/person/:personId" 
                 render={(props)=><Person {...props.match.params} 
                                   tags={this.state.tags}/>}/>
          <Route path="/search/:searchString" 
                 render={(props)=><Search {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}
                                   searchLabels={searchLabels}/>}/>
          <Route path="/person/:personId" 
                 render={(props)=><AddBox {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}
                                   addThing={this.addThing}
                                   addTagToPerson={this.addTagToPerson}/>}/>
        </Col>
        </Row>
      </Container>
      </div>
    )
  }
}

const AppBox = withRouter(App);

const FullApp = () => (
  <Router>
    <div>
      <Route path="/:mode?/:data?" component={AppBox}/>
    </div>
  </Router>
)
export default FullApp