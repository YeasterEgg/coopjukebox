import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Answers } from '../api/answers.js';

class Pollifier extends Component {
  constructor(props){
    super(props)
    this.state = {
      loggedIn: false,
      code: this.props.queryParams["code"],
      sessionState: this.props.queryParams["state"]
    }
  }
  render() {
    if(this.state.code && (this.state.sessionState == localStorage.getItem("sessionState"))){
      console.log('wow')
      localStorage.removeItem("sessionState")
    }
    if(!this.state.loggedIn){
      return (
        <div className="container">
          <header>
            <h1 onClick={this.testServer}>Test</h1>
          </header>
          <br />
          <br />
          <br />
          <header>
            <h1 onClick={this.testCall}>Test2</h1>
          </header>
        </div>
      )
    }else{
      return (
        <div className="container">
          <header>
            <h1 onClick={this.testServer}>Test</h1>
          </header>
        </div>
      )
    }
  }

  testServer(){
    state = "randomStringISwear"
    localStorage.setItem("sessionState", state)
    Meteor.call('getAuth', state, function(error, redirectUrl){
      console.log(redirectUrl)
      window.location.replace(redirectUrl)
    })
  }

  renderAnswers(){
    if(this.props.answers.length > 0){
      return(<p>{this.props.answers[0].text}</p>)
    }else{
      console.log(this.props)
      return (null)
    }
  }

  testCall(){
    state = "randomStringISwear"
    Session.set("state", state)
    Meteor.call("ajaxCall", state, function(error, response){
      console.log(response)
    })
  }

}


Pollifier.propTypes = {
  answers: PropTypes.array.isRequired,
  queryParams: PropTypes.object.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('answers');
  return {
    answers: Answers.find({}).fetch(),
  };
}, Pollifier);
