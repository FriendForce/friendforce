import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import List from './components/List.jsx';
import '@firebase/firestore';

class App extends React.Component {
  constructor(props) {
    super(props);

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
      authDomain: "friendforce-25851.firebaseapp.com",
      databaseURL: "https://friendforce-25851.firebaseio.com",
      projectId: "friendforce-25851",
      storageBucket: "friendforce-25851.appspot.com",
    };
    firebase.initializeApp(config);

    var uiConfig = {
      signInSuccessUrl: 'http://127.0.0.1:3000/auth/facebook/callback',
      signInOptions: [ firebase.auth.FacebookAuthProvider.PROVIDER_ID ],
      tosUrl: '/' // Terms of service url.
    };

    window.firebase = firebase;
    console.log('firebase.firestore', firebase.firestore)

     // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);

    // firebase.auth().onAuthStateChanged(function(user) {
    //   if (user) {
    //     this.state.setState({ status: 'signed in'});
    //     this.state.setState({ status: 'signed in'});
    //     var displayName = user.displayName;
    //   } else {
    //     this.state.setState({ status: 'signed out'});
    //   }
    // }

    this.state = { 
      items: ['Ben', 'Micah', 'Adrienne']
    }
  }

  componentDidMount() {
  }

  render () {
    return (<div>
      <h1>Friend Force</h1>
      <List items={this.state.items}/>
      <div id="firebaseui-auth-container"></div>
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));