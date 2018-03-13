import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import List from './components/List.jsx';
import TagEntrySearch from './components/TagEntrySearch/TagEntrySearch.js';

import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';

class App extends React.Component {
  constructor(props) {
    super(props);

    // *** Initialize Firebase
    var config = {
      apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
      authDomain: "friendforce-25851.firebaseapp.com",
      databaseURL: "https://friendforce-25851.firebaseio.com",
      projectId: "friendforce-25851",
      storageBucket: "friendforce-25851.appspot.com",
    };
    firebase.initializeApp(config);

    // *** Firebase UI
    var uiConfig = {
      // signInSuccessUrl: 'http://127.0.0.1:3000/auth/facebook/callback',
      signInSuccessUrl: '/',
      signInOptions: [ firebase.auth.FacebookAuthProvider.PROVIDER_ID ],
      tosUrl: '/' // Terms of service url.
    };

    window.firebase = firebase; // for dev purposes
    console.log('firebase.firestore', firebase.firestore) // for dev purposes

     // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());

    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    var that = this;

    firebase.auth().onAuthStateChanged(function(user) {
      console.log('auth state changed!')
      console.log('user', user);
      if (user) {
        that.setState({ displayName: user.displayName });
        that.setState({ status: 'signed in'});
        // user.getIdToken().then(function(accessToken) {
        //   // make request for 
        // });
      } else {
        that.setState({ status: 'signed out'});
      }
    });

    this.state = { 
      items: ['Ben', 'Micah', 'Adrienne'],
      status: 'signed out',
      displayName: 'anonymous',
    };
  }

  render () {
    return (<div>
      <h1>Friend Force</h1>
      <p>Hello { this.state.displayName }!</p>
      <p>Status: { this.state.status }</p>
      <List items={this.state.items}/>
      <div id="firebaseui-auth-container"></div>
	<TagEntrySearch />
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
