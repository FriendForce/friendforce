
import firebase from 'firebase'

import 'firebase/firestore';

const config = {
  apiKey: "AIzaSyCMO50yQLEyIw_u6aptgBmK3qsRmhpUjxQ",
  authDomain: "friendforce-25851.firebaseapp.com",
  projectId: "friendforce-25851",
};

firebase.initializeApp(config);


const settings = {timestampsInSnapshots: true};
firebase.firestore().settings(settings);
firebase.firestore().enablePersistence();

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth(); 
export default firebase;
