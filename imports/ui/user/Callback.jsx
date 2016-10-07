import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Waiter from '../common/Waiter.jsx'

export default class Voter extends Component {

  componentWillMount(){
    queryParams = this.props.location.query
    if(queryParams["code"] && (queryParams["state"] === localStorage.getItem("sessionId"))){
      Meteor.call("loggedUsers.findOrCreate", queryParams["code"], queryParams["state"], function(error, result){
        if(result){
          window.location.replace(Meteor.absoluteUrl())
        }else{
          window.location.replace("http://www.google.com")
        }
      })
    }
  }

  render(){
    return(
      <Waiter />
    )
  }
}
