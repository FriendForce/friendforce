import React from 'react';
import ReactDOM from 'react-dom';
import TagButtons from 'react-tag-buttons';
import 'react-tag-buttons/lib/css/styles.css';
import Avatar from 'react-avatar';

export default class Person extends React.Component {

  constructor(props){
      super(props);
      console.log(props);
      this.state = {
          selectedDataSource: []
      };
  }

  onTagClick = (currSelectedState, id, text) => {
      let {selectedDataSource} = this.state;
      if(!currSelectedState){
          selectedDataSource.push({id:id, text:text});
      }else{
          selectedDataSource = selectedDataSource.filter((item)=>{return item.id !== id});
      }
      this.setState({
          selectedDataSource: selectedDataSource
      });
  };

  render() {
    const {selectedDataSource} = this.state;

    var divStyle = {
      marginRight: 20,
    };

    var divd = {
      border: '1px solid black',
    }
    return (
        <div style={divd}>
        <h2> 
          <Avatar name={this.props.name} style={divStyle} round={true}/>{this.props.name}
        </h2>
        <TagButtons
            dataSource={this.props.tagsList}
            selectedDataSource={selectedDataSource}
            onTagClick={this.onTagClick}
        />
        </div>);
  }
}

