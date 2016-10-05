import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import Waiter from '../common/Waiter.jsx'

export default class Voter extends Component {

  componentWillMount(){
    queryParams = this.props.location.query
    if(queryParams["code"] && (queryParams["state"] === localStorage.getItem("sessionId"))){
      Meteor.call("createUser", queryParams["code"], queryParams["state"])
      window.location.replace(Meteor.absoluteUrl())
    }
  }

  render(){
    return(
      <Waiter />
    )
  }
}
