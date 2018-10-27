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
import HowTo from './Onboarding/HowTo.js';
import Onboarding from './Onboarding/Onboarding.js';
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom';
import MouseTrap from 'mousetrap';
import Overlay from './Overlay/Overlay.jsx';
import Feedback from './Feedback/Feedback.jsx';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

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
      //TODO: push tag updates to children
      account: {},
      token: '',
      tokenTimestamp: 0,
      publicity: 'public',
      lastCreatedTag: null,
    };

    // Bound Functions
    this.setPerson = this.setPerson.bind(this);
    this.setTag = this.setTag.bind(this);
    this.setLabel = this.setLabel.bind(this);
    this.addPerson = this.addPerson.bind(this);
    this.addTagToPerson = this.addTagToPerson.bind(this);
    this.unsetLabel = this.unsetLabel.bind(this);
    this.unsetMostRecentLabel = this.unsetMostRecentLabel.bind(this);
    this.updateData = this.updateData.bind(this);
    this.setUser = this.setUser.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.updateTag = this.updateTag.bind(this);
    this.deleteTag = this.deleteTag.bind(this);
    this.createPerson = this.createPerson.bind(this);
    this.createTag = this.createTag.bind(this);
    this.updateAccount = this.updateAccount.bind(this);
    this.refreshTags = this.refreshTags.bind(this);
    this.refreshPersons = this.refreshPersons.bind(this);
    this.refreshLabels = this.refreshLabels.bind(this);
    this.onPublicityChanged = this.onPublicityChanged.bind(this);
    this.setSpecial = this.setSpecial.bind(this);
    this.unsetSpecial = this.unsetSpecial.bind(this);
    this.goBack = this.goBack.bind(this);
    this.submitFeedback = this.submitFeedback.bind(this);

    this.hotkeys = {
      a: {
        function: this._onA,
        description: 'Go to Adding Tag Mode',
      },
      s: {
        function: this._onS,
        description: 'Go to Search Mode',
      },
      right: {
        function: this._goToNext,
        description: 'test',
      },
      p: {
        function: this._togglePrivate,
        description: 'Toggle whether next tag is private',
      },
      '[': {
        function: this._plusOne,
        description: 'Add trust to someone',
      },
      ']': {
        function: this._minusOne,
        description: 'Remove Trust to someone',
      },
      '\\': {
        function: this._hadConvo,
        description: 'Mark this person as someone',
      },
      f: {
        function: this._displayFeedback,
        description: 'Give Feedback',
      },
      'command+k': {
        function: this._displayCommands,
        description: 'Display Commands',
      },
      esc: {
        function: this._onEsc,
        description: 'Go Back',
      },
      'p p': {
        function: this._flipPublicity,
        description: 'Change the publicity of the last created tag',
      },
      'd d': {
        function: this._deleteLastTag,
        description: 'Delete the last create tag',
      },
    };
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
        account: {},
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
    DataStore.tagCallback = this.refreshTags;
    DataStore.labelCallback = this.refreshLabels;
    DataStore.personCallback = this.refreshPersons;
  };

  goBack = () => {
    if (!this.props.match.params.data) {
      this.props.history.push('/');
    } else if (this.props.match.params.mode === 'person-edit') {
      this.props.history.push('/person/' + this.props.match.params.data);
    } else {
      this.props.history.goBack();
    }
  };

  _onA = e => {
    e.preventDefault();
    console.log(this.props.match);
    console.log(this.props.location);
    if (
      this.props.match.params.mode &&
      this.props.match.params.mode.startsWith('person') &&
      this.props.match.params.data
    ) {
      this.props.history.push('/person-edit/' + this.props.match.params.data);
    }
    if (document.getElementById('addBoxInput')) {
      document.getElementById('addBoxInput').focus();
    }
  };

  _onS = e => {
    e.preventDefault();
    this.props.history.push('/search');
    this.refreshLabels();
    if (document.getElementById('searchBoxInput')) {
      document.getElementById('searchBoxInput').focus();
    }
  };

  _onEsc = () => {
    if (document.getElementById('myNav').style.display === 'block') {
      document.getElementById('myNav').style.display = 'none';
    } else if (document.getElementById('feedback').style.display === 'block') {
      document.getElementById('feedback').style.display = 'none';
    } else if (
      this.props.match.params.mode &&
      this.props.match.params.mode === 'person'
    ) {
      this.props.history.push('/');
    } else {
      this.props.history.goBack();
    }
  };

  _deleteLastTag = () => {
    this.deleteTag(this.state.lastCreatedTag);
    this.setState({ lastCreatedTag: null });
  };

  _flipPublicity = () => {
    var tag = this.state.tags.filter(tag => {
      return tag.id === this.state.lastCreatedTag;
    })[0];
    var publicity = tag.publicity;
    if (publicity === 'public') {
      publicity = 'private';
    } else {
      publicity = 'public';
    }
    this.updateTag(this.state.lastCreatedTag, { publicity: publicity });
  };

  _plusOne = () => {
    console.log('plusOne');
    this.addTagToPerson('+1', 'private');
  };

  _minusOne = () => {
    console.log('minusOne');
    this.addTagToPerson('-1', 'private');
  };

  _hadConvo = () => {
    console.log('hadConvo');
    this.addTagToPerson('had convo', 'private');
  };

  _displayCommands = () => {
    if (
      document.getElementById('myNav').style.display === 'none' ||
      document.getElementById('myNav').style.display === ''
    ) {
      document.getElementById('myNav').style.display = 'block';
    } else {
      document.getElementById('myNav').style.display = 'none';
    }
  };

  _displayFeedback = () => {
    if (
      document.getElementById('feedback').style.display === 'none' ||
      document.getElementById('feedback').style.display === ''
    ) {
      document.getElementById('feedback').style.display = 'block';
      document.getElementById('feedbackForm').focus();
    } else {
      document.getElementById('feedback').style.display = 'none';
    }
  };

  onPublicityChanged = () => {
    console.log('toggling publicity from ' + this.state.publicity);
    if (this.state.publicity === 'private') {
      this.setState({ publicity: 'public' });
    } else if (this.state.publicity === 'public') {
      this.setState({ publicity: 'private' });
    }
  };

  _togglePrivate = () => {
    this.onPublicityChanged();
    console.log('togglePrivate');
  };

  componentDidMount = () => {
    Object.keys(this.hotkeys).forEach(key => {
      MouseTrap.bind(key, this.hotkeys[key].function);
    });
    auth.onAuthStateChanged(user => {
      console.log('setting user:');
      console.log(user);
      if (user) {
        var userId = user.email;
        this.setState({ userId: userId });
      }
    });
  };

  componentWillUnmount = () => {
    Object.keys(this.hotkeys).forEach(key => {
      MouseTrap.unbind(key, this.hotkeys[key].function);
    });
  };

  componentWillUpdate = (nextProps, nextState) => {
    if (nextState.userId !== this.state.userId) {
      if (auth.currentUser) {
        auth.currentUser.getIdToken(true).then(idToken => {
          //TODO: check if new user and do login flow
          DataStore.getUserPerson(idToken).then(response => {
            if (response.new_account == true) {
              this.props.history.push('/new');
            }
            this.setState({
              userPerson: response.person.slug,
              account: response.account,
            });
          });
          this.setState({
            userName: auth.currentUser.displayName,
            token: idToken,
            tokenTimestamp: new Date(),
          });
          DataStore.pullEverything(nextState.userId, this.updateData, idToken);
        });
      } else {
        console.log('no current user');
      }
    }
  };

  updateData = () => {
    DataStore.getAllTags().then(tags => {
      this.setState({ tags: tags });
    });
    DataStore.getAllPersons().then(persons => {
      this.setState({ persons: persons });
    });
    this.refreshLabels();
  };

  refreshTags = () => {
    DataStore.getAllTags().then(tags => {
      console.log('tag callback called!');
      this.setState({ tags: tags });
    });
  };

  refreshPersons = () => {
    DataStore.getAllPersons().then(persons => {
      this.setState({ persons: persons });
    });
  };

  refreshLabels = () => {
    var type = 'generic';
    if (
      this.props.match.params.mode &&
      this.props.match.params.mode.startsWith('person')
    ) {
      if (this.props.match.params.special) {
        type = this.props.match.params.special;
      }
    } else if (
      this.props.match.params.mode &&
      this.props.match.params.mode === 'search'
    ) {
      type = getSearchLabels(this.props.match.params.data).slice(-1);
    }
    DataStore.getAllLabels(type).then(labels => {
      this.setState({ labels: labels });
    });
  };

  checkToken = () => {
    var p = new Promise((resolve, reject) => {
      if (new Date() - this.state.tokenTimestamp > 45000) {
        auth.currentUser.getIdToken(true).then(idToken => {
          this.setState({
            token: idToken,
            tokenTimestamp: new Date(),
          });
          resolve(idToken);
        });
      } else {
        resolve(this.state.token);
      }
    });
    return p;
  };

  updateTag = (id, params) => {
    this.checkToken().then(idToken => {
      DataStore.updateTag(id, params, idToken);
      // Will this change propigate automatically?
      DataStore.getAllTags().then(tags => {
        this.setState({ tags });
      });
    });
  };

  deleteTag = id => {
    this.checkToken().then(idToken => {
      DataStore.deleteTag(id, idToken).then(() => {
        DataStore.getAllTags().then(tags => {
          this.setState({ tags });
        });
      });
    });
  };

  createPerson = (name, dontSync = false) => {
    var p = new Promise((resolve, reject) => {
      this.checkToken().then(idToken => {
        DataStore.addPersonByName(name, idToken, dontSync).then(id => {
          resolve(id);
        });
      });
    });
    return p;
  };

  updateAccount(params) {
    this.checkToken().then(idToken => {
      DataStore.updateAccount(idToken, params).then(account => {
        this.setState((account: account));
      });
    });
  }

  addPerson = name => {
    // Todo: need to check if you actually want to add a person
    // When you're in search mode because people accidentally add new thing
    // Todo: add keyboard interactions to this:https://github.com/GA-MO/react-confirm-alert/
    confirmAlert({
      title: 'Confirm Person',
      message: 'Are you sure you want to create a person named ' + name,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            this.checkToken().then(idToken => {
              //Todo - for speed dont wait for server
              DataStore.addPersonByName(name, idToken).then(id => {
                this.props.history.push('/person/' + id);
              });
            });
          },
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  componentDidMount() {
    // Add firebase script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/4.13.0/firebase.js';
    script.async = true;
    document.body.appendChild(script);
  }

  submitFeedback = feedback => {
    var p = new Promise((resolve, reject) => {
      this.checkToken().then(idToken => {
        DataStore.submitFeedback(feedback, idToken).then(response => {
          console.log('got feedback response');
          console.log(response);
          resolve(response);
        });
      });
    });
    return p;
  };

  createTag = (label, subject, publicity = 'public', dontSync = false) => {
    var p = new Promise((resolve, reject) => {
      this.checkToken().then(idToken => {
        DataStore.addTag(
          subject,
          label,
          this.state.userPerson,
          this.state.userId,
          idToken,
          publicity,
          dontSync
        ).then(id => {
          this.setState({ lastCreatedTag: id });
          DataStore.getAllTags().then(tags => {
            this.setState({ tags: tags });
          });
          resolve(id);
        });
      });
    });
    return p;
  };

  addTag = (label, subject, publicity = 'public', dontSync = false) => {
    this.checkToken().then(idToken => {
      DataStore.addTag(
        subject,
        label,
        this.state.userPerson,
        this.state.userId,
        idToken,
        publicity,
        dontSync
      ).then(id => {
        this.setState({ lastCreatedTag: id });
        DataStore.getAllTags().then(tags => {
          this.setState({ tags: tags });
        });
        DataStore.getAllLabels().then(labels => {
          this.setState({ labels: labels });
        });
      });
    });
  };

  addTagToPerson = (label, publicity = 'public') => {
    var subject = this.props.match.params.data;
    this.addTag(label, subject, publicity);
  };

  setPerson = person => {
    this.props.history.push('/person/' + person.id);
  };

  setLabel = label => {
    // Case where you're setting a special
    var special = null;
    if (
      this.props.match.params.data &&
      this.props.match.params.data.slice(-1) === ':'
    ) {
      label = getSearchLabels(this.props.match.params.data).slice(-1) + label;
      special = getSearchLabels(this.props.match.params.data).slice(-1)[0];
    }
    if (
      this.props.match.params.mode === 'search' &&
      this.props.match.params.data
    ) {
      var newPath = this.props.location.pathname + '+' + label;
      if (special) {
        const searchLabels = getSearchLabels(newPath.split('/').slice(-1));
        const newLabels = searchLabels.filter(label => label !== special);
        newPath = '/search/' + labelsToString(newLabels);
        DataStore.getAllLabels().then(labels => {
          this.setState({ labels: labels });
        });
      }
      this.props.history.push(encodeURI(newPath));
    } else {
      this.props.history.push('/search/' + encodeURI(label));
    }
    if (label.slice(-1) === ':') {
      DataStore.getAllLabels(label.slice(0, -1)).then(labels => {
        this.setState({ labels: labels });
      });
    }
  };

  setSpecial = special => {
    if (special.slice(-2) === ':' && special.slice(-1) === ':') {
      special = special.slice(0, -1);
    }
    if (special.slice(-1) !== ':') {
      special = special + ':';
    }
    if (this.props.match.params.mode.startsWith('person')) {
      var person = this.props.match.params.data;
      this.props.history.push('/person/' + person + '/' + encodeURI(special));
      DataStore.getAllLabels(special).then(labels => {
        this.setState({ labels: labels });
      });
    } else {
      console.log('not in person mode');
    }
  };

  setTag = tag => {
    this.setLabel(tag.label);
  };

  unsetLabel = targetLabel => {
    const searchLabels = getSearchLabels(this.props.match.params.data);
    const newLabels = searchLabels.filter(label => label !== targetLabel);
    this.props.history.push('/search/' + labelsToString(newLabels));
    if (targetLabel.slice(-1) === ':') {
      DataStore.getAllLabels().then(labels => {
        this.setState({ labels: labels });
      });
    } else if (labelsToString(newLabels).slice(-1) == ':') {
      DataStore.getAllLabels(newLabels.slice(-1)).then(labels => {
        this.setState({ labels: labels });
      });
    }
  };

  unsetMostRecentLabel = () => {
    const searchLabels = getSearchLabels(this.props.match.params.data);
    if (
      this.props.match.params.data &&
      this.props.match.params.data.slice(-1) === ':'
    ) {
      DataStore.getAllLabels().then(labels => {
        this.setState({ labels: labels });
      });
    }
    const newLabels = searchLabels.slice(0, -1);
    this.props.history.push('/search/' + labelsToString(newLabels));
  };

  unsetSpecial = () => {
    if (this.props.match.params.mode.startsWith('person')) {
      var person = this.props.match.params.data;
      this.props.history.push(
        '/' + this.props.match.params.mode + '/' + person
      );
      DataStore.getAllLabels().then(labels => {
        this.setState({ labels: labels });
      });
    } else {
      console.log('not in person mode');
    }
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
    var specialLabel = null;
    if (
      this.props.match.params.mode &&
      this.props.match.params.mode.startsWith('person') &&
      this.props.match.params.special
    ) {
      specialLabel = decodeURI(this.props.match.params.special);
    }

    var searchLabels = [];
    if (
      this.props.match.params.mode &&
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

            {this.state.account.connected_facebook ? (
              <div />
            ) : (
              <div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    this.props.history.push('/onboarding');
                  }}
                >
                  Load Your Facebook Friends
                </button>
              </div>
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
            render={props => <HowTo {...props.match.params} />}
          />
          <Route
            path="/onboarding"
            render={props => (
              <Onboarding
                {...props.match.params}
                createPerson={this.createPerson}
                createTag={this.createTag}
                updateAccount={this.updateAccount}
              />
            )}
          />
          <Row>
            <Col>
              <Route
                path="( |/)"
                render={props => (
                  <button
                    className="btn btn-primary btn-sm active"
                    aria-pressed="true"
                    onClick={this._onS}
                  >
                    Search (Press S)
                  </button>
                )}
              />
              <Route
                path="/person"
                render={props => (
                  <button
                    className="btn btn-primary btn-sm active"
                    aria-pressed="true"
                    onClick={this._onA}
                  >
                    Add Attributes (Press A)
                  </button>
                )}
              />
              <Route
                path="(/search| )"
                render={props => (
                  <Omnibox
                    {...props.match.params}
                    searchLabels={searchLabels}
                    persons={this.state.persons}
                    tags={this.state.tags}
                    labels={this.state.labels}
                    addPerson={this.addPerson}
                    setPerson={this.setPerson}
                    setTag={this.setTag}
                    unsetLabel={this.unsetLabel}
                    unsetMostRecentLabel={this.unsetMostRecentLabel}
                    setLabel={this.setLabel}
                    refreshLabels={this.refreshLabels}
                    goBack={this.goBack}
                  />
                )}
              />
              <Route
                path="/person-edit/:personId"
                render={props => (
                  <AddBox
                    {...props.match.params}
                    onPublicityChanged={this.onPublicityChanged}
                    publicity={this.state.publicity}
                    tags={this.state.tags}
                    persons={this.state.persons}
                    addTagToPerson={this.addTagToPerson}
                    labels={this.state.labels}
                    setSpecial={this.setSpecial}
                    unsetSpecial={this.unsetSpecial}
                    specialLabel={specialLabel}
                    refreshLabels={this.refreshLabels}
                    goBack={this.goBack}
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
              <Overlay hotkeys={this.hotkeys} />
              <Feedback submitFeedback={this.submitFeedback} />
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
                path="/person*/:personId"
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
    <div id="app">
      <Route path="/:mode?/:data?/:special?" component={AppBox} />
    </div>
  </Router>
);
export default FullApp;
