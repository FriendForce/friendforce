import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import List from './components/List.jsx';
import TagEntrySearch from './components/TagEntrySearch/TagEntrySearch.js';
import './main.css';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import axios from 'axios';

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

    this.state = { 
      items: ['Ben', 'Micah', 'Adrienne'],
      status: 'signed out',
      displayName: 'anonymous',
      email: 'anonymous',
      friends: [{name: "Jimmy"}, {name: "Jack"}],
    };

    this.signIn = this.signIn.bind(this);
    this.user = {}; // why is this not part of the state?
    this.db = firebase.firestore();
    // window.db = this.db;
  }

  componentWillMount() {
    var that = this;

    firebase.auth().onAuthStateChanged(function(user) {
      console.log('auth state changed!')
      console.log('user', user);
      if (user) {
        window.user = user;
        that.setState({ displayName: user.displayName });
        that.setState({ status: 'signed in'});

        // populate friends
        that.db.collection("users").where("email", "==", "adrienne@adriennetran.com")
          .get()
          .then(function(querySnapshot) { 
            querySnapshot.forEach(function(doc) {
              that.setState({ friends: doc.data()["friends"] });
            });
          }
        );
      }
    });
  }

  signIn() {
    var that = this; // Why?
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('user_friends');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      if (result.credential) {
        var token = result.credential.accessToken;
        that.user = result.user;
        that.setState({ status: 'signed in', displayName: user.displayName, email: user.email });

        // user has been added to auth, next to do
        // add user to database
        // TODO: check for user's email in database before adding
        var userRef = that.db.collection("users").doc(user.email)
        userRef.set({
          name: user.displayName,
          email: user.email,
          accessToken: { facebook: token },
          photoURL: user.photoURL,
        }).then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error){
          console.error("Error adding new user: ". error);
        })

        var friendsUrl = 'https://graph.facebook.com/me/taggable_friends?access_token=' + token;
        function recur() {
          axios.get(friendsUrl)
            .then(function(res) {
              var friends = res.data.data;
              console.log("friends: ");
              console.log(friends);
              // add friends
              userRef.set({
                friends: friends,
              }, { merge: true });
            });
        }
        recur();
        // TODO: go to next page
      }
    }).catch(function(error){
      that.setState({ status: 'signed out'});
      console.log('error', error);
    })
  }

  populateGraphFromFacebook = db => {
    var that = this;
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('user_friends');
    // TODO: refactor out that's and use => instead
    firebase.auth().signInWithPopup(provider).then(function(result) {
      if (result.credential) {
        var token = result.credential.accessToken;
        that.user = result.user;
        that.setState({ status: 'signed in', displayName: user.displayName, email: user.email });

        var friendsUrl = 'https://graph.facebook.com/me/taggable_friends?access_token=' + token;
        function recur() {
          axios.get(friendsUrl)
            .then(function(res) {
              var friends = res.data.data;
              console.log("friends: ");
              console.log(friends);
            });
        }
        recur();
        // TODO: go to next page
      }
    }).catch(function(error){
      that.setState({ status: 'signed out'});
      console.log('error', error);
    })
  }


  render () {
    const friends = (this.state.friends).map((f) => 
      <li key={f["name"]}>
        { f["name"] }
      </li>
    )

    return (<div>
      <h1>Friend Force</h1>
      <p>Hello { this.state.displayName }!</p>
      <p>Status: { this.state.status }</p>
      {this.state.status === "signed out" && <button onClick={this.signIn}>Sign in with facebook</button>}
      <button onClick={this.populateGraphFromFacebook}>Grab friends from FB </button>
      <h1>Friends</h1>
      { friends }
      <div id="firebaseui-auth-container"></div>
	    <TagEntrySearch  db={this.db} />
    </div>)
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
