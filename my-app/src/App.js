import React, { Component } from 'react';
import './App.css';
import Omnibox from './Omnibox/Omnibox.jsx';
import Person from './Person/Person.jsx';
import Search from './Search/Search.jsx';
import Home from './Home/Home.jsx';
import DataStore from './DataStore.jsx';
import AddBox from './AddBox/AddBox.jsx';
import LabelButton from './Person/LabelButton.jsx';
import { Container, Row, Col } from 'reactstrap';
import TestStuff from './TestStuff.jsx';
import PersonList from './PersonList.js';
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

    this.state = { 
      tags:[],
      persons:[],
      labels:[],
      userId:'benjamin_reinhardt',
      showTestStuff:false
    };
    
    //DataStore.firebasePull(this.state.userId)
    //.then(()=>{
   
    //this.saveState();
    //});
    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
    this.setLabel = this.setLabel.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addTagToPerson = this.addTagToPerson.bind(this);
    this.unsetLabel = this.unsetLabel.bind(this);
    this.updateData = this.updateData.bind(this);
    this.setUser = this.setUser.bind(this);
  }

  loadState = () => {
    DataStore.loadState();
  }

  saveState = () => {
    DataStore.saveState();
  }

  componentDidMount = () => {
    this.loadState();
    this.updateData();
    this.saveState();
  }


  updateData = () => {
    DataStore.getAllTags()
    .then((tags) =>{
      this.setState({tags});
    });
    DataStore.getAllPersons()
    .then((persons) =>{
      this.setState({persons:persons});
    });
    DataStore.getAllLabels()
    .then((labels) =>{
      this.setState({labels:labels});
    });
  }

  createPerson = (name, dontSync=false) => {
    var p = new Promise((resolve, reject) => {
      DataStore.addPersonByName(name, this.state.userId, dontSync)
      .then((id)=>{
        resolve(id);

      });
    });
    return p;
  }

  addPerson = name => {
    // Todo: need to check if you actually want to add a person 
    // When you're in search mode because people accidentally add new thing

    DataStore.addPersonByName(name, this.state.userId)
      .then((id)=>{
        this.props.history.push('/person/'+id);
        DataStore.getAllPersons()
        .then((persons) =>{
          this.setState({persons:persons});
          this.saveState();
        });
      });
  }

  componentDidMount () {
      // Add firebase script
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/firebasejs/4.13.0/firebase.js";
      script.async = true;
      document.body.appendChild(script);

  }

  createTag = (label, subject, publicity='public', dontSync=false) => {
     const originator = this.state.userId;
     var p = new Promise((resolve, reject) => {
      DataStore.addTag(subject, label, originator, this.state.userId, publicity, dontSync)
      .then((id)=>{
        resolve(id);
      });
     });
     return p;    
  }

  addTag = (label, subject, publicity='public', dontSync=false) => {
    const originator = this.state.userId;
    DataStore.addTag(subject, label, originator, this.state.userId, publicity, dontSync)
    .then((id)=>{
      DataStore.getAllTags()
      .then((tags) =>{
        this.setState({tags:tags});
        this.saveState();
      });
      DataStore.getAllLabels()
      .then((labels) =>{
        this.setState({labels:labels});
        this.saveState();
      });
    });
  } 

  addTagToPerson = (label, publicity='public') => {
    var subject = this.props.match.params.data;
    this.addTag(label, subject, publicity);
  } 



  setPerson = person => {
    console.log('set person: ' + person.name);
    this.props.history.push('/person/'+person.id);
  }

  setLabel = label => {
    if (this.props.match.params.mode === "search" && this.props.match.params.data) {
      this.props.history.push(this.props.location.pathname+"+"+label.replace(/[^A-Z0-9]/ig, "_"));
    } else {
      this.props.history.push('/search/'+ label);
    }
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

  /* Test Instrumentation Code */
  setUser = userId => {
    this.setState({userId:userId});
  }

  toggleTestStuff = () => {
    this.setState({showTestStuff:!this.state.showTestStuff});
  }


  render () {

    var searchLabels = [];
    if (this.props.match.params.mode === "search" && this.props.match.params.data) {
      searchLabels = getSearchLabels(this.props.match.params.data);
    } 
    var labelButtons = [];
    this.state.labels.forEach((label)=> {
      labelButtons.push(<LabelButton key={label} label={label} setTag={this.setTag}/>);
    });
    return (
      <div>
        <div id="firebaseui-auth-container"></div>
        <Container>
        <div>
        <button onClick={this.toggleTestStuff.bind(this)}>
        Toggle Test Instrumentation
        </button>
        {this.state.showTestStuff && <TestStuff updateData={this.updateData}  setUser={this.setUser} userId={this.state.userId}/>}
        </div>
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
            labels={this.state.labels}
            addPerson={this.addPerson}
            setPerson={this.setPerson}
            setTag={this.setTag} 
            unsetLabel={this.unsetLabel}
            setLabel={this.setLabel}
          />
          <Route path="/person/:personId" 
                 render={(props)=><AddBox {...props.match.params} 
                                   tags={this.state.tags}
                                   persons={this.state.persons}
                                   addTagToPerson={this.addTagToPerson}
                                   labels={this.state.labels}/>}/>
          <Row>
          <Route exact path="/" render={(props)=><Home
                                   createPerson={this.createPerson}
                                   addTag={this.addTag}
                                   updateData={this.updateData}
                                   saveState={this.saveState}/>}/>
          </Row>
          {labelButtons}
        </Col>
        
        <Col>

          <Route path="/all_people/"
                 render={(props)=><PersonList {...props.match.params}
                                persons={this.state.persons}
                                addTagToPerson={this.addTagToPerson}
                                />}/>
          
          
          <Route path="/person/:personId" 
                 render={(props)=><Person {...props.match.params} 
                                   tags={this.state.tags.filter(tag=>tag.subject === props.match.params.personId)}
                                   person={this.state.persons.filter(person=>person.id===props.match.params.personId)}
                                   setTag={this.setTag}/>}/>
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