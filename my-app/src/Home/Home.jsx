
import React, { Component } from 'react';

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
        // Create a person for each person
        this.props.createPerson(name,dontSync)
        .then((id)=>{
          this.props.addTag(defaultLabel,id,"private",dontSync); 
        });
      }
      this.props.updateData();
    } 
    fr.readAsText(files[0]); 
  }



  render() {
    return(
      <div>
        <input type="file" id="files" name="files[]" 
        multiple onChange={(e) => this.uploadFBData(e.target.files)} />  
      </div>);
  }
}