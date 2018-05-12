import React, {Component} from 'react';
import TagButtons from 'react-tag-buttons';
import 'react-tag-buttons/lib/css/styles.css';
import Avatar from 'react-avatar';
import DataStore from '../DataStore.jsx';

export default class Person extends Component {


  constructor(props){
    super(props);

    this.state = {
      selectedDataSource: [],
      tags: [],
      personName: ''
    };
  }

  componentDidMount() {
    console.log("did mount")
    this._updateDataModel(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._updateDataModel(nextProps);
  }

  _updateDataModel(props) {
    DataStore.getTagsBySubject(props.personId).then((tags) => {
      var new_tags = [];
      for (let i = 0; i < tags.length; i++) {
        var tag = tags[i];
        new_tags.push({
          id: i, text: tag["label"], tag_id: tag["id"]
        });
      }
      console.log(tags);
      this.setState({tags: new_tags});

      DataStore.getPersonByID(props.personId).then((person) =>{
        var personName = person["name"];
        console.log(personName);
        this.setState({personName: personName});
      });
    });
  }

  onTagClick = (currSelectedState, id, text) => {
      let {selectedDataSource} = this.state;
      if (!currSelectedState) {
          selectedDataSource.push({id:id, text:text});
      } else {
          selectedDataSource = selectedDataSource.filter((item)=>{return item.id !== id});
      }
      this.setState({
          selectedDataSource: selectedDataSource
      });
  };

  render() {
    console.log("render")
    const {selectedDataSource} = this.state;
    var divStyle = {

      marginRight: 20,
    };

    var divd = {
      border: '1px solid black',
    };
    
    var personCard = this.state.personName === null ? (<div/>) : (
      <div><Avatar name={this.state.personName} style={divStyle} round={true}/>
        {this.state.personName}
      </div>
    );

    return (
        <div style={divd}>
          <h2> 
            {personCard}
          </h2>
          <TagButtons
              dataSource={this.state.tags}
              selectedDataSource={selectedDataSource}
              onTagClick={this.onTagClick}
          />
        </div>);
  }
}

