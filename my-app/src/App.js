import React, { Component } from 'react';
import { auth, provider, persistence } from './firebase.js';
import './App.css';
import Omnibox from './Omnibox/Omnibox.jsx';
import PersonBox from './PersonBox/PersonBox.jsx';
import Search from './Search/Search.jsx';
import Home from './Home/Home.jsx';
import DataStore from './FlaskDataStore.jsx';
import AddBox from './AddBox/AddBox.jsx';
import LabelButton from './PersonBox/LabelButton.jsx';
import { Container, Row, Col } from 'reactstrap';
import TestStuff from './TestStuff.jsx';
import PersonList from './PersonList.js';
import Onboarding from './Onboarding/Onboarding.js';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';

const getSearchLabels = searchString => {
  return decodeURI(searchString).split('+');
};

const labelsToString = labels => {
  var labelString = '';
  labels.forEach((label, i) => {
    if (i > 0) {
      labelString += '+';
    }
    labelString += encodeURI(label);
  });
  return labelString;
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      persons: [],
      labels: [],
      userId: null,
      userName: null,
      userPerson: null,
      showTestStuff: false,
      showAllLabels: false,
      token: '',
    };

    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
    this.setLabel = this.setLabel.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addTagToPerson = this.addTagToPerson.bind(this);
    this.unsetLabel = this.unsetLabel.bind(this);
    this.updateData = this.updateData.bind(this);
    this.setUser = this.setUser.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.updateTag = this.updateTag.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
  }

  login() {
    auth.setPersistence(persistence).then(() => {
      auth.signInWithPopup(provider).then(result => {
        var userId = result.user.email;
        this.setState({ userId: userId });
      });
    });
  }

  logout() {
    auth.signOut().then(() => {
      DataStore.resetData();
      this.updateData();
      this.setState({
        userId: null,
        token: null,
      });
    });
  }

  componentWillMount = () => {
    var env = DataStore.getEnv();
    if (env === 'prod') {
      window.is_dev = false;
    } else {
      window.is_dev = true;
    }
  };

  componentDidMount = () => {
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log(user);
        var userId = user.email;
        this.setState({ userId: userId });
      }
    });
  };

  componentWillUpdate = (nextProps, nextState) => {
    if (nextState.userId !== this.state.userId) {
      if (auth.currentUser) {
        auth.currentUser.getIdToken(true).then(idToken => {
          //TODO: check if new user and do login flow
          DataStore.getUserPerson(idToken).then(response => {
            console.log('got response to login');
            console.log(response);
            if (response.new_account == true) {
              console.log('new account! Hello!');
              //TODO: new user flow
            }
            this.setState({ userPerson: response.person.slug });
          });
          this.setState({
            userName: auth.currentUser.displayName,
            token: idToken,
          });
          DataStore.pullEverything(nextState.userId, this.updateData, idToken);
        });
      }
    }
  };

  updateData = () => {
    DataStore.getAllTags().then(tags => {
      this.setState({ tags });
    });
    DataStore.getAllPersons().then(persons => {
      this.setState({ persons: persons });
    });
    DataStore.getAllLabels().then(labels => {
      this.setState({ labels: labels });
    });
  };

  updateTag = (id, params) => {
    DataStore.updateTag(id, params);
    // Will this change propigate automatically?
  };

  deleteTag = id => {
    DataStore.deleteTag(id, this.state.token).then(() => {
      DataStore.getAllTags().then(tags => {
        this.setState({ tags });
      });
    });
  };

  createPerson = (name, dontSync = false) => {
    var p = new Promise((resolve, reject) => {
      DataStore.addPersonByName(name, this.state.userId, dontSync).then(id => {
        resolve(id);
      });
    });
    return p;
  };

  addPerson = name => {
    // Todo: need to check if you actually want to add a person
    // When you're in search mode because people accidentally add new thing

    DataStore.addPersonByName(name, this.state.userId).then(id => {
      this.props.history.push('/person/' + id);
      DataStore.getAllPersons().then(persons => {
        this.setState({ persons: persons });
      });
    });
  };

  componentDidMount() {
    // Add firebase script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/4.13.0/firebase.js';
    script.async = true;
    document.body.appendChild(script);
  }

  createTag = (
    label,
    subject,
    originator,
    publicity = 'public',
    dontSync = false
  ) => {
    var p = new Promise((resolve, reject) => {
      DataStore.addTag(
        subject,
        label,
        originator,
        this.state.userId,
        this.state.token,
        publicity,
        dontSync
      ).then(id => {
        resolve(id);
      });
    });
    return p;
  };

  addTag = (
    label,
    subject,
    originator,
    publicity = 'public',
    dontSync = false
  ) => {
    DataStore.addTag(
      subject,
      label,
      originator,
      this.state.userId,
      this.state.token,
      publicity,
      dontSync
    ).then(id => {
      DataStore.getAllTags().then(tags => {
        this.setState({ tags: tags });
      });
      DataStore.getAllLabels().then(labels => {
        this.setState({ labels: labels });
      });
    });
  };

  addTagToPerson = (label, publicity = 'public') => {
    var subject = this.props.match.params.data;
    this.addTag(label, subject, publicity);
  };

  setPerson = person => {
    console.log('set person: ' + person.name);
    this.props.history.push('/person/' + person.id);
  };

  setLabel = label => {
    if (
      this.props.match.params.mode === 'search' &&
      this.props.match.params.data
    ) {
      this.props.history.push(
        encodeURI(this.props.location.pathname + '+' + label)
      );
    } else {
      this.props.history.push('/search/' + encodeURI(label));
    }
  };

  setTag = tag => {
    this.setLabel(tag.label);
  };

  unsetLabel = targetLabel => {
    const searchLabels = getSearchLabels(this.props.match.params.data);
    const newLabels = searchLabels.filter(label => label !== targetLabel);
    this.props.history.push('/search/' + labelsToString(newLabels));
  };

  /* Test Instrumentation Code */
  setUser = userId => {
    this.setState({ userId: userId });
  };

  toggleTestStuff = () => {
    this.setState({ showTestStuff: !this.state.showTestStuff });
  };

  toggleLabels = () => {
    this.setState({ showAllLabels: !this.state.showAllLabels });
  };

  getUserName = () => {
    DataStore.getPersonByID(this.state.userId).then(user => {
      return user.name;
    });
  };

  render() {
    var labelButtons = [];
    this.state.labels.forEach(label => {
      labelButtons.push(
        <LabelButton key={label} label={label} setTag={this.setTag} />
      );
    });

    var searchLabels = [];
    if (
      this.props.match.params.mode === 'search' &&
      this.props.match.params.data
    ) {
      searchLabels = getSearchLabels(this.props.match.params.data);
    }

    var labelToggleButtonName = 'Show All Labels';
    if (this.state.showAllLabels === true) {
      labelToggleButtonName = 'Hide All Labels';
    }

    return (
      <div>
        <div id="firebaseui-auth-container" />
        <div>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            {window.is_dev ? (
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={this.toggleTestStuff.bind(this)}
                >
                  Toggle Test Instrumentation
                </button>
              </div>
            ) : (
              <div />
            )}

            {this.state.userId ? (
              <div>
                <span className="navbar-text">
                  {' '}
                  Welcome {this.state.userName}
                </span>
                <button
                  className="btn btn-outline-success"
                  onClick={this.logout}
                  type="button"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                className="btn btn-outline-success"
                onClick={this.login}
                type="button"
              >
                Log In
              </button>
            )}
          </nav>
        </div>
        <Container>
          {window.is_dev ? (
            <div>
              {this.state.showTestStuff && (
                <TestStuff
                  updateData={this.updateData}
                  setUser={this.setUser}
                  userId={this.state.userId}
                />
              )}
            </div>
          ) : (
            <div />
          )}
        </Container>

        <Container>
          <Route
            path="/new"
            render={props => <Onboarding {...props.match.params} />}
          />
          <Row>
            <Col>
              <Route
                path={/^(?!.*new).*$/}
                render={props => (
                  <Omnibox
                    {...props.match.params}
                    //mode = {this.props.match.params.mode}
                    searchLabels={searchLabels}
                    //searchString={this.props.match.params}
                    persons={this.state.persons}
                    tags={this.state.tags}
                    labels={this.state.labels}
                    addPerson={this.addPerson}
                    setPerson={this.setPerson}
                    setTag={this.setTag}
                    unsetLabel={this.unsetLabel}
                    setLabel={this.setLabel}
                  />
                )}
              />
              <Route
                path="/person/:personId"
                render={props => (
                  <AddBox
                    {...props.match.params}
                    tags={this.state.tags}
                    persons={this.state.persons}
                    addTagToPerson={this.addTagToPerson}
                    labels={this.state.labels}
                  />
                )}
              />
              <Row>
                <Home />
              </Row>
              <button
                className="btn btn-primary btn-sm active"
                aria-pressed="true"
                onClick={this.toggleLabels.bind(this)}
              >
                {labelToggleButtonName}
              </button>
              {this.state.showAllLabels && labelButtons}
            </Col>

            <Col>
              <Route
                path="/all_people/"
                render={props => (
                  <PersonList
                    {...props.match.params}
                    persons={this.state.persons}
                    addTagToPerson={this.addTagToPerson}
                  />
                )}
              />

              <Route
                path="/person/:personId"
                render={props => (
                  <PersonBox
                    {...props.match.params}
                    tags={this.state.tags.filter(
                      tag => tag.subject === props.match.params.personId
                    )}
                    person={this.state.persons.filter(
                      person => person.id === props.match.params.personId
                    )}
                    setTag={this.setTag}
                    updateTag={this.updateTag}
                    deleteTag={this.deleteTag}
                  />
                )}
              />
              <Route
                path="/search/:searchString"
                render={props => (
                  <Search
                    {...props.match.params}
                    tags={this.state.tags}
                    persons={this.state.persons}
                    searchLabels={searchLabels}
                  />
                )}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const AppBox = withRouter(App);

const FullApp = () => (
  <Router>
    <div>
      <Route path="/:mode?/:data?" component={AppBox} />
    </div>
  </Router>
);
export default FullApp;
