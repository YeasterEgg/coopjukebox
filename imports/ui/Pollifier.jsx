import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import { Tokens } from '../api/tokens.js';

class Pollifier extends Component {

  render() {
    if(queryParams["code"] && (queryParams["state"] == localStorage.getItem("sessionState"))){
      localStorage.removeItem("sessionState")
      Meteor.call("getToken", queryParams["code"], function(error, result){
      })
    }
    return (
      <div className="container">
        <header>
          <h1 onClick={this.testServer}>Test</h1>
        </header>
        <br/>
        <br/>
        <br/>
        <br/>
        <header>
          <h1><a href="http://localhost:3000">Home</a></h1>
        </header>
      </div>
    )
  }

  testServer(){
    state = "randomStringISwear"
    localStorage.setItem("sessionState", state)
    Meteor.call('getAuth', state, function(error, redirectUrl){
      window.location.replace(redirectUrl)
    })
  }

}


Pollifier.propTypes = {
  tokens: PropTypes.array.isRequired,
  queryParams: PropTypes.object.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('tokens');
  return {
    tokens: Tokens.find({}).fetch(),
  };
}, Pollifier);
