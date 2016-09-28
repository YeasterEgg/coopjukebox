import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Answers } from '../api/answers.js';


class App extends Component {

  render() {
    return (
      <div className="container">
        <header>
          <h1 onClick={this.testServer}>Test</h1>
        </header>
        {this.renderAnswers()}
      </div>
    );
  }

  testServer(){
    Meteor.call('getAuth')
  }

  renderAnswers(){
    if(this.props.answers.length > 0){
      return(<p>{this.props.answers[0].text}</p>)
    }else{
      console.log(this.props)
      return (null)
    }
  }

}


App.propTypes = {
  answers: PropTypes.array.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('answers');
  return {
    answers: Answers.find({}).fetch(),
  };
}, App);
