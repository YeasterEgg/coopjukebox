import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

import { LoggedUsers } from '../api/loggedUsers.js'

const crypto = require('crypto')

class Pollifier extends Component {

  // State set

  constructor(props){
    super(props)
    this.state = {
      loggedUser: false,
      playlistPresent: false,
      currentUser: null
    }
  }

  // Force the check at the DOMready, or something like that

  componentDidMount(){
    Meteor.call("loggedUsers.fromSessionId", localStorage.sessionId, function(error, result){
      if(result.logged){
        this.setState({loggedUser: true, currentUser: result.user})
        console.log(this.state)
        if(result.user.playlist.playlistSpotifyId){
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
      return(<div>{this.renderWaiter()}</div>)
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
        <div className="homepage--father_container">{this.renderSpotifyForm()}</div>
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

  renderSpotifyForm(){
    if(this.state.playlistPresent){
      return(
        <div>{this.renderSearchForm()}</div>
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

  renderSearchForm(){
    return(
      <div className="home--search_form">CIAONE</div>
    )
  }

  // Classic Methods

  getAuth(){
    sessionId = crypto.randomBytes(64).toString('hex')
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
      this.setState("playlistPresent", true)
    })
  }

  addTrackToPlaylist(){
    userId = this.state.currentToken.userId
    playlistId = "ciao"
    url = "https://api.spotify.com/v1/users/" + this.state.currentToken.userId + "/playlists/{playlist_id}/tracks"
  }

}

Pollifier.propTypes = {
  subscription: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
};

export default createContainer(() => {
  const usersSubscription = Meteor.subscribe('loggedUsers')

  return {
    users: LoggedUsers.find().fetch(),
    subscription: usersSubscription.ready()
  };
}, Pollifier);
