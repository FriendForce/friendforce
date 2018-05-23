import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
  authDomain: "friendforce-25851.firebaseapp.com",
  databaseURL: "https://friendforce-25851.firebaseio.com",
  projectId: "friendforce-25851",
  storageBucket: "friendforce-25851.appspot.com",
  messagingSenderId: "481774833081"
};

firebase.initializeApp(config);
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth(); 
export default firebase;
