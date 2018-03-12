import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import List from './components/List.jsx';
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
      // authDomain: '/',
    };
    firebase.initializeApp(config);

    this.state = { 
      items: ['Ben', 'Micah', 'Adrienne'],
      status: 'signed out',
      displayName: 'anonymous',
    };

    this.signIn = this.signIn.bind(this);
  }

  componentWillMount() {



    // *** Firebase UI
    // var uiConfig = {
    //   // signInSuccessUrl: 'http://127.0.0.1:3000/auth/facebook/callback',
    //   signInSuccessUrl: 'http://127.0.0.1:3000/',
    //   // signInSuccessUrl: '/',
    //   signInOptions: [{
    //     provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //     scopes: ['email', 'user_friends']
    //   }],
    //   tosUrl: '/' // Terms of service url.
    // };

    // window.firebase = firebase; // for dev purposes
    // console.log('firebase.firestore', firebase.firestore) // for dev purposes

    //   // Initialize the FirebaseUI Widget using Firebase.
    // var ui = new firebaseui.auth.AuthUI(firebase.auth());

    // // The start method will wait until the DOM is loaded.
    // ui.start('#firebaseui-auth-container', uiConfig);

    // var that = this;

    // firebase.auth().onAuthStateChanged(function(user) {
    //   console.log('auth state changed!')
    //   console.log('user', user);
    //   if (user) {
    //     window.user = user;
    //     that.setState({ displayName: user.displayName });
    //     that.setState({ status: 'signed in'});


    //     firebase.auth().currentUser.getToken()
    //     .then(function(token){
    //       console.log('token1', token)
    //     })

    //     console.log('token2', AccessToken.getCurrentAccessToken());

    //     // user.getIdToken().then(function(accessToken) {
    //       console.log('inside getIdToken')
    //       console.log('accessToken', user.accessToken);
    //       // make request for fb friends
    //       var friendsUrl = 'https://graph.facebook.com/me/taggable_friends?access_token=' + user.accessToken;
    //       function recur() {
    //         console.log('recur', recur)
    //         axios.get(friendsUrl)
    //           .then(function(res) {
    //             console.log('res', res)
    //             var friends = res.data.data;
    //             console.log('friends');
    //           });
    //       }
    //       recur();

    //     // });
    //   } else {
    //     that.setState({ status: 'signed out'});
    //   }
    // });
  }

  signIn() {
    var that = this;
    var provider = new firebase.auth.FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('user_friends');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      if (result.credential) {
        var token = result.credential.accessToken;
        var user = result.user;
        that.setState({ status: 'signed in'});
        that.setState({ displayName: user.displayName });

        console.log('user', user);
        console.log('token', token);
        var friendsUrl = 'https://graph.facebook.com/me/taggable_friends?access_token=' + token;
        function recur() {
          console.log('recur', recur)
          axios.get(friendsUrl)
            .then(function(res) {
              var friends = res.data.data;
              console.log('friends', friends);
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
    return (<div>
      <h1>Friend Force</h1>
      <p>Hello { this.state.displayName }!</p>
      <p>Status: { this.state.status }</p>
      <List items={this.state.items}/>
      <button onClick={this.signIn}>Sign in with facebook</button>
      <div id="firebaseui-auth-container"></div>
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
