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

const labelsToString = (labels) => {
  const formattedLabels = labels.map(label=> label.replace(" ", "%"));
  var labelString = "";
  formattedLabels.forEach((label, i) => {
    if (i > 0) {
      labelString += "+";
    }
    labelString += label;
  });
  return labelString;
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
      user:'benjamin_reinhardt'
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
    this.addPerson = this.addPerson.bind(this);
    this.addTagToPerson = this.addTagToPerson.bind(this);
    this.unsetLabel = this.unsetLabel.bind(this);
  }

  addPerson = name => {
    // Todo: need to check if you actually want to add a person 
    // When you're in search mode because people accidentally add new thing

    DataStore.addPersonByName(name)
      .then((id)=>{
        this.props.history.push('/person/'+id);
        DataStore.getAllPersons()
        .then((persons) =>{
          this.setState({persons:persons});
        });
      });
  }

    componentDidMount () {
        const script = document.createElement("script");

        script.src = "https://www.gstatic.com/firebasejs/4.13.0/firebase.js";
        script.async = true;

        document.body.appendChild(script);
    }

  

  addTagToPerson = (label, publicity='public') => {
    var subject = this.props.match.params.data;
    var originator = this.state.user;
    DataStore.addTag(subject, label, originator, publicity)
    .then((id)=>{
      DataStore.getAllTags()
      .then((tags) =>{
        this.setState({tags:tags});
      });
    });
    console.log("creating and adding tag " + label + " to " 
                + subject + "with publicity " + publicity);
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
    if (this.props.match.params.mode === "search" && this.props.match.params.data) {
      this.props.history.push(this.props.location.pathname+"+"+tag.label.replace(/[^A-Z0-9]/ig, "_"));
    } else {
      this.props.history.push('/search/'+tag.label);
    }
  }

  unsetLabel = targetLabel => {
    const searchLabels = getSearchLabels(this.props.match.params.data);
    const newLabels = searchLabels.filter(label =>(label !== targetLabel));
    this.props.history.push('/search/'+labelsToString(newLabels));
  }


  render () {

    var searchLabels = [];
    if (this.props.match.params.mode === "search" && this.props.match.params.data) {
      searchLabels = getSearchLabels(this.props.match.params.data);
    } 
    return (
      <div>
        <div id="firebaseui-auth-container"></div>
        <Container>
        <button onClick={()=>{DataStore.firebaseSync(this.state.user)}}>TEST SYNC </button>
        </Container>
        <Container>
        <Row>
        <Col>

          <Omnibox
            mode = {this.props.match.params.mode} 
            searchLabels = {searchLabels}
            searchString={this.props.match.params}
            persons={this.state.persons} 
            tags={this.state.tags}
            addPerson={this.addPerson}
            addThing={this.addThing}
            setPerson={this.setPerson}
            setTag={this.setTag} 
            unsetLabel={this.unsetLabel}
          />
          <Route path="/person/:personId" 
                 render={(props)=><AddBox {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}
                                   addThing={this.addThing}
                                   addTagToPerson={this.addTagToPerson}/>}/>
        </Col>
        
        <Col>
          <Route exact path="/" component={Home}/>
          <Route path="/person/:personId" 
                 render={(props)=><Person {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}/>}/>
          <Route path="/search/:searchString" 
                 render={(props)=><Search {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}
                                   searchLabels={searchLabels}/>}/>
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