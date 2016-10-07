import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
const crypto = require('crypto')

export default class AuthButton extends Component {

  render(){
    return(
      <button className="pure-button pure-button-primary songlist_creator--auth_button" onClick={this.getAuth.bind(this)}>Access through Spotify</button>
    )
  }

  getAuth(){
    sessionId = crypto.randomBytes(32).toString('hex')
    localStorage.clear()
    localStorage.setItem("sessionId", sessionId)
    Meteor.call('getAuthUrl', sessionId, function(error, spotifyAuthUrl){
      window.location.replace(spotifyAuthUrl)
    })
  }
}
