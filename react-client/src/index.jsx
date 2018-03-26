import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import List from './components/List.jsx';
import TagEntrySearch from './components/TagEntrySearch/TagEntrySearch.js';
import './main.css';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import '@firebase/firestore';
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
      user_id: '0'
    };

    this.signIn = this.signIn.bind(this);
    this.user = {};
    this.db = firebase.firestore();
    // window.db = this.db;
  }

  componentWillMount = db => {
    var that = this;

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        window.user = user;
        that.setState({ displayName: user.displayName });
        that.setState({ status: 'signed in'});
        that.db.collection("people").where("email", "==", user.email)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              that.setState({user_id:doc.id});
              console.log("logged in user " + doc.id);
            });
          });
        /* this is broken for not-adrienne
        // populate friends
        that.db.collection("users").where("email", "==", user.email)
          .get()
          .then(function(querySnapshot) { 
            querySnapshot.forEach(function(doc) {
              that.setState({ friends: doc.data()["friends"] });
            });
          }
        );
        */
      }
    });
  }

  signIn = db => {
    var that = this;
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('user_friends');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      if (result.credential) {
        var token = result.credential.accessToken;
        var user = result.user;
        that.setState({ status: 'signed in', displayName: user.displayName, email: user.email });

        // Check if the user exists as a person
        that.db.collection("people").where("email", "==", user.email).get().then(function(querySnapshot) {
          var email_matches = querySnapshot.size;
          querySnapshot.forEach(function(doc) {
            that.db.collection("people").doc(doc.id)
              .set({
                name: user.displayName,
                email: user.email,
                accessToken: { facebook: token },
                isUser: "true"
                }, {merge: true}
              );
          });
          return email_matches;
        }).then(function(email_matches){
          if (email_matches == 0) {
            that.db.collection("people").where("name", "==", user.displayName).get().then(
              function(querySnapshot) {
                var name_matches = querySnapshot.size;
                querySnapshot.forEach(function(doc) {
                  that.db.collection("people").doc(doc.id)
                    .set({
                      name: user.displayName,
                      email: user.email,
                      accessToken: { facebook: token },
                      isUser: "true"
                      }, {merge: true}
                    );
                });
                if (name_matches == 0 && email_matches == 0) {
                  //create new user
                }
                return name_matches;
              });
          }
        });
          
       //TODO: how to do logic on email matches and name matches?
      
       
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
          // docRef is null
          //console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error){
          console.error("Error adding new user: ", error);
        })

        var friendsUrl = 'https://graph.facebook.com/me/friends?access_token=' + token;
        function recur() {
          axios.get(friendsUrl)
            .then(function(res) {
              var friends = res.data.data;

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

  signOut = db => {
    var that  = this;
    firebase.auth().signOut().then(function() {
      that.setState({status: 'signed out', displayName: 'anonymous', email: 'anonymous',});
    // Sign-out successful.
    }).catch(function(error) {
    // An error happened.
      console.log("sign out error", error);
    });
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
      {this.state.status === "signed in" && <button onClick={this.signOut}> Sign out </button>}
      <h1>Friends</h1>
      { friends }
      <div id="firebaseui-auth-container"></div>
      <TagEntrySearch />
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
