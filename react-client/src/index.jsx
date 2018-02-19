import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import * as firebase from "firebase";

class App extends React.Component {
  constructor(props) {
    super(props);

    var config = {
      apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
      authDomain: "friendforce-25851.firebaseapp.com",
      databaseURL: "https://friendforce-25851.firebaseio.com",
      storageBucket: "friendforce-25851.appspot.com",
    };
    firebase.initializeApp(config);
    console.log('config', config);
    console.log('firebase', firebase);

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
    </div>)
  }
}

ReactDOM.render(<App />, document.getElementById('app'));