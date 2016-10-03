import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

export default class Voter extends Component {

  componentWillMount(){
    queryParams = this.props.location.query
    if(queryParams["code"] && (queryParams["state"] == localStorage.getItem("sessionId"))){
      Meteor.call("createUser", queryParams["code"], queryParams["state"])
      window.location.replace("http://localhost:3000")
    }
  }

  render(){
    return(
      <div>{this.renderWaiter()}</div>
    )
  }

  renderWaiter(){
    return(
      <div className="loader--container">
        <div className="loader--dots">
          {"{"}<span>.</span><span>.</span><span>.</span>{"}"}
        </div>
      </div>
    )
  }

}
