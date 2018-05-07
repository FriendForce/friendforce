// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.firestore().collection('messages').add({original: original}).then((writeResult) => {
    // Send back a message that we've succesfully written the message
    return res.json({result: `Message with ID: ${writeResult.id} added.`});
  });
  // [END adminSdkAdd]
});
// [END addMessage]

exports.clearGarbagePeople = functions.https.onRequest((req, res) => {
  
  return admin.firestore().collection('persons').get().then((queryResult) => {
    var numBadPersons = 0;
    var batch = admin.firestore().batch();
    queryResult.forEach((doc)=> {
      // everybody needs a timestamp
      if (typeof doc.data().timestamp === 'undefined') {
        batch.delete(doc.ref);
        numBadPersons += 1;
        if (numBadPersons > 450) {
          batch.commit();
          return res.json({result: `more than 450 bad people, rerun function`});
        }
      }
    });
    batch.commit();
    return res.json({result: `Successfully deleted ${numBadPersons} persons`});
  })
  .catch((error) => {
    return res.json({result:`${error}`})
  });
});

exports.deduplicatePersons = functions.https.onRequest((req, res) => {
  
  return admin.firestore().collection('persons').get().then((queryResult) => {
    var ben = {name:'ben'};

    var persons = new Map();
    var duplicatePersons = new Map();
    queryResult.forEach((result)=> {
      var person = result.data();
      //todo make this get rid of capitalization etc
      person.id = result.id;
      if (typeof persons.get(person.name) === 'undefined') {
        persons.set(person.name, person);
      } else {
        // Confirm that the duplicate name is a duplicate person
        duplicatePerson = {new_id:persons.get(person.name).id}
        duplicatePersons.set(person.id)
        //merge with existing person
        // retarget all tags that reference them
        // delete them

      }
    });
    return persons;
  })
  .then((persons)=> {
     var numPersons = 0;
     persons.forEach((person) => {
      numPersons += 1;
     });
     return res.json({result: `Got ${numPersons} persons`});
  })
  .catch((error) => {
    return res.json({result:`${error}`})
  });
});
    /*var persons = new Map();
    queryRequest.forEach((result)=> {
      var person = result.data();
      //todo make this get rid of capitalization etc
      person.id = result.id();
      if (typeof persons.get(person.name) === 'undefined') {
        persons.set(person.name, person);
      } 
    });
    return persons;
  })
  .then((persons)=>{
    var names = [];
    persons.forEach((name, person)=> {
      names.push(name);
    });
    return res.json({result: `${names}`});
  });
});
*/

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });
