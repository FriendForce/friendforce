
import React, { Component } from 'react';

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

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

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

  //Todo LinkedIn Data
  // Todo Contact Data



  render() {
    return(
      <div>
        <input type="file" id="files" name="files[]" 
        multiple onChange={(e) => this.uploadFBData(e.target.files)} />  
      </div>);
  }
}