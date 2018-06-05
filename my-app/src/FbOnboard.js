import FB from 'fb';
import React, { Component } from 'react';
import firebase, { auth, fbProvider } from './firebase.js';
import Person from './Types/Person.js';

const facebookDateToDate = (facebookDate) => {
  if (facebookDate === "Today") {
    return new Date(Date.now());
  }
  if (facebookDate.split(" ").length === 2) {
    return new Date(facebookDate + " " + new Date(Date.now()).getFullYear());
  }
  else {
    return new Date(facebookDate);
  }
}

const   creator = (o, data, node) => {
  var content = document.createElement(node);
  content.cellspacing = "3"
  var cell = document.createTextNode(data);
  content.appendChild(cell);
  o.appendChild(content);
  }

export default class Home extends Component {

  uploadFBData = files => {
    console.log("uploading fb data from " + files);
    const defaultLabel = "from facebook";
    const dontSync = true;
    var fr = new FileReader();
    fr.onload = e => {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(e.target.result, "text/html");
      var friend_html = htmlDoc.body.children[1].children[2].children;
      for (var i = 0; i < friend_html.length; i++) {
        // TODO: need to handle corner case where person has >2 names
        
        var name = friend_html[i].innerText.split(" (")[0];
        const addedDate = facebookDateToDate(friend_html[i].innerText.split(" (")[1].split(")")[0]);

        // Create a person for each person
        this.props.createPerson(name,dontSync)
        .then((id)=>{
          this.props.addTag(defaultLabel,id,"private",dontSync);
          this.props.addTag("datemetfb:"+addedDate,id,"private",dontSync); 
        });
      }
      this.props.saveState();
      this.props.updateData();
    } 
    fr.readAsText(files[0]); 
  }

  uploadFbJsonData = files => {
    console.log("uploading fb data from " + files);
    var fr = new FileReader();
    fr.onload = e => {
      var json = JSON.parse(e.target.result);
      json.forEach(person => {
        console.log("adding "+person.name);
      });   
    }
    fr.readAsText(files[0]); 
  }



  displayData = (arr) => {
  var table = document.createElement('table');
  var thead = document.createElement('thead');
  table.appendChild(thead);
  var row = document.createElement('tr');
  creator(row, 'Name', 'th');
  creator(row, 'FB ID', 'th');
  creator(row, 'Type', 'th');
  creator(row, 'Score', 'th');
  thead.appendChild(row);
  var tbody = document.createElement('tbody');
  table.appendChild(tbody);
  for(var i=0; i < arr.length; i++){
    var type = arr[i].type;
    var row = document.createElement('tr');
    creator(row, arr[i]["text"], 'td');
    creator(row, arr[i]["uid"], 'td');
    creator(row, Object.keys(arr[i]["grammar_costs"])[0].slice(0,-1).substring(1), 'td');
    creator(row, arr[i]["grammar_costs"][Object.keys(arr[i]["grammar_costs"])[0]], 'td');
    tbody.appendChild(row);
  }
  document.body.innerHTML = "";
  document.body.appendChild(table);
}

  grabFacebookThings = (id) => {
    //need to find user's unique id. Trying each of the below until succeeds.
    //facebook keeps changing their variables and keys

    const url = "//www.facebook.com/ajax/typeahead/search/facebar/bootstrap/?viewer=" + id + "&__a=1";
    var x = new XMLHttpRequest();
    x.onreadystatechange=function(){
      if (x.readyState==4 && x .status==200){
        var srr=JSON.parse(x.responseText.substring(9)).payload.entries;
        this.displayData(srr);
      }
    }
    x.open("GET",url,true);
    x.send();
  }

  loginWithFacebook = () => {
    fbProvider.setCustomParameters({
      'display':'popup'
    });
    auth.signInWithPopup(fbProvider)
    .then(result => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("user token!");
      console.log(token);
      FB.setAccessToken(token);
      FB.api("/search?q={$_POST['Benjamin Reinhardt']}&type=user", res => {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          return;
        }   
        console.log(res);
      });

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log('error!');
      console.log(error);
      // ...
    });
  }

  // Todo LinkedIn Data
  // Todo Contact Data



  render() {
    return(
      <div>
      <button onClick={this.loginWithFacebook.bind(this)}> Login With Facebook </button>

      <input type="file" id="files" name="files[]" 
        multiple onChange={(e) => this.uploadFBData(e.target.files)} />
      <input type="file" id="files" name="files[]" 
        multiple onChange={(e) => this.uploadFbJsonData(e.target.files)} />   
      </div>);
  }
}