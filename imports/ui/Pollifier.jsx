import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import { Tokens } from '../api/tokens.js';

class Pollifier extends Component {

  constructor(props){
    super(props)
    this.state = {
      tokenValid: false,
      currentToken: false
    }
  }

  render(){
    if(this.props.subscription){
      return(<div>{this.renderPage()}</div>)
    }else{
      return(<div>{this.renderWaiter()}</div>)
    }
  }

  renderPage(){
    if(this.state.tokenValid){
      return (
        <div className="container">
          <div className="home--playlist_form">
            <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" />
            <button type="submit" onClick={this.createPlaylist.bind(this)}>Crea playlist</button>
          </div>
        </div>
      )
    }else{
      return (
        <div className="container">
          <header>
            <h1 onClick={this.getAuth.bind(this)}>Get token man</h1>
          </header>
        </div>
      )
    }
  }

  componentDidMount(){
    Meteor.call("tokens.lastValid",function(error, result){
      console.log(result)
      if(result.valid){
        this.setState({tokenValid: true, currentToken: result.token })
      }else if(result.token){
        this.refreshToken(result.token)
      }
    }.bind(this))
  }

  refreshToken(token){
    console.log("refresh me plz!")
    console.log(token)
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

  getAuth(){
    state = Math.random().toString(36).substring(7)
    localStorage.setItem("sessionState", state)
    Meteor.call('getAuth', state, function(error, redirectUrl){
      window.location.replace(redirectUrl)
    })
  }

  createPlaylist(){
    playlistName = document.getElementById("playlist_name").value
    options =  {
      "name": playlistName,
      "public": true
    }
    url = "https://api.spotify.com/v1/users/" + this.state.currentToken.userId + "/playlists"
    token = this.state.currentToken.accessToken
    Meteor.call("createPlaylist", url, token, options, this.state.currentToken.userId, function(result){
      console.log(result)
    })
  }

  addTrackToPlaylist(){
    userId = this.state.currentToken.userId
    playlistId = "ciao"
    url = "https://api.spotify.com/v1/users/" + this.state.currentToken.userId + "/playlists/{playlist_id}/tracks"
  }

}

Pollifier.propTypes = {
  tokens: PropTypes.array.isRequired,
  subscription: PropTypes.bool.isRequired,
  playlistId: PropTypes.string.isRequired,
};

export default createContainer(() => {
  const tokensSubscription = Meteor.subscribe('tokens')

  return {
    tokens: Tokens.find().fetch(),
    subscription: tokensSubscription.ready()
  };
}, Pollifier);
