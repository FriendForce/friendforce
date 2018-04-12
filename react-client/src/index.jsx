import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import List from './components/List.jsx';
import TagEntrySearch from './components/TagEntrySearch/TagEntrySearch.js';
import './main.css';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import axios from 'axios';
import persons from './components/ConstData/persons.js';
import tags from './components/ConstData/tags.js';
import Omnibox from './components/Omnibox/Omnibox.jsx';

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
      user_id: 'no_id'
    };

    this.signIn = this.signIn.bind(this);
    this.user = {}; // why is this not part of the state?
    this.db = firebase.firestore();
    // window.db = this.db;
  }

  componentWillMount = db => {
    var that = this;

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // Check whether the person is a user in the db
        that.db.collection("people").where("email", "==", user.email)
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.size == 0) {
              // do new user flow
              console.log("creating new user");
            } else if (querySnapshot.size == 1) {
              window.user = user;
              that.setState({ displayName: user.displayName });
              that.setState({ status: 'signed in'});
              querySnapshot.forEach((doc) => {
                that.setState({user_id:doc.id});
              });
          } else {
            // multiple users - problem here
            console.log("error - multiple users for email " + user.email);
          }
        });
      } else {
        console.log("no user " + user);
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
        
        // Check if the user exists as a person
        that.db.collection("people").where("email", "==", user.email).get().then(function(querySnapshot) {
          var email_matches = querySnapshot.size;
          if (email_matches == 1) {
            querySnapshot.forEach(function(doc) {
              that.setState(
                  { status: 'signed in', 
                    displayName: user.displayName, 
                    email: user.email, 
                    user_id:doc.id });
              that.db.collection("people").doc(doc.id)
                .set({
                  name: user.displayName,
                  email: user.email,
                  accessToken: { facebook: token },
                  isUser: "true"
                  }, {merge: true}
                );
            });
          } else if (email_matches > 1) {
              console.log("error: multiple matching users");
          }
          return email_matches;
        }).then(function(email_matches){
          if (email_matches == 0) {
            that.db.collection("people").where("name", "==", user.displayName).get().then(
              function(querySnapshot) {
                var name_matches = querySnapshot.size;
                if (name_matches == 1) {
                  that.setState({ 
                    status: 'signed in', 
                    displayName: user.displayName, 
                    email: user.email, 
                    user_id:doc.id });
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
                } else if (email_matches > 1) {
                  console.log("error: multiple matching users");
                }
                if (name_matches == 0 && email_matches == 0) {
                  //create new person who is a user
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
      <div id="firebaseui-auth-container"></div>
      <Omnibox persons={persons} tags={tags} />
    </div>)
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
