import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Waiter from './Waiter.jsx'

request = require('request')
querystring = require('querystring')

import { LoggedUsers } from '../api/loggedUsers.js'

const crypto = require('crypto')

export default class Pollifier extends Component {

  // State set

  constructor(props){
    super(props)
    this.state = {
      loggedUser: false,
      playlistPresent: false,
      currentUser: null,
      trackList: [],
    }
  }

  // Force the check at the DOMready, or something like that

  componentWillMount(){
    Meteor.call("loggedUsers.fromSessionId", localStorage.sessionId, function(error, result){
      if(result.logged){
        this.setState({loggedUser: true, currentUser: result.user})
        if(result.user.playlistSpotifyId){
          this.setState({playlistPresent: true})
        }
      }
    }.bind(this))
  }

  // Rendering Methods

  render(){
    if(this.props.subscription){
      return(<div>{this.renderPage()}</div>)
    }else{
      return(<Waiter />)
    }
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

  renderPage(){
    if(this.state.loggedUser){
      return (
        <div className="homepage--father_container">{this.renderPlaylist()}</div>
      )
    }else{
      return (
        <div className="homepage--father_container">{this.renderAuthButton()}</div>
      )
    }
  }

  renderAuthButton(){
    return(
      <button className="pure-button pure-button-primary homepage--central_button" onClick={this.getAuth.bind(this)}>Access through Spotify</button>
    )
  }

  renderPlaylist(){
    if(this.state.playlistPresent){
      return(
        <div>{this.renderPlaylistLink()}</div>
      )
    }else{
      return(
        <div className="home--playlist_form">
          <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" />
          <button type="submit" onClick={this.createPlaylist.bind(this)}>Crea playlist</button>
        </div>
      )
    }
  }

  renderPlaylistLink(){
    pollUrl = "http://localhost:3000/pl/" + this.state.currentUser.pollId
    return(
      <div className="homepage--poll_url">
        <div className="homepage--poll_label">Use the following url:</div>
        <a className="homepage--poll_id" href={pollUrl}>{pollUrl}</a>
      </div>
    )
  }

  getAuth(){
    sessionId = crypto.randomBytes(64).toString('base64')
    localStorage.setItem("sessionId", sessionId)
    Meteor.call('getAuthUrl', sessionId, function(error, spotifyAuthUrl){
      if(!error){
        window.location.replace(spotifyAuthUrl)
      }else{
        console.log(error)
      }
    })
  }

  createPlaylist(){
    playlistName = document.getElementById("playlist_name").value
    options =  {
      "name": playlistName,
      "public": true
    }
    userSpotifyId = this.state.currentUser.spotifyId
    url = "https://api.spotify.com/v1/users/" + userSpotifyId + "/playlists"
    token = this.state.currentUser.token.accessToken
    userId = this.state.currentUser._id
    Meteor.call("createPlaylist", url, token, options, userId, function(result){
      this.setState({playlistPresent: true})
    }.bind(this))
  }
}

Pollifier.propTypes = {
  subscription: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
}

export default createContainer(() => {
  const usersSubscription = Meteor.subscribe('loggedUsers')

  return {
    users: LoggedUsers.find().fetch(),
    subscription: usersSubscription.ready()
  }
}, Pollifier)
