import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import SonglistManager from './SonglistManager.jsx'

export default class PlaylistsManager extends Component {

  constructor(props){
    super(props)
    this.state = {
      currentPlaylist: false,
    }
  }

  render(){
    console.log(this.state)
    if(!this.state.currentPlaylist){
      return(
        <div>{this.renderPlaylistIndex()}</div>
      )
    }else{
      return(
        <SonglistManager playlist={this.state.currentPlaylist} userId={this.props.userId} />
      )
    }
  }

  renderPlaylistIndex(){
    if(this.props.playlists.length > 0){
      return(
        <div className="playlist_manager--playlist_index">
          <ul>
          {this.props.playlists.map(function(playlist){
            return(
              <li key={playlist.spotifyId} onClick={function(){this.clickOnPlaylist.bind(this)(playlist)}.bind(this)}>
                {"Name: " + playlist.name}
              </li>
            )
          }.bind(this))}
          </ul>
          {this.renderNewPlaylistForm()}
        </div>
      )
    }else{
      return(
        <div className="playlist_manager--playlist_index">
          {this.renderNewPlaylistForm()}
        </div>
      )
    }
  }

  renderNewPlaylistForm(){
    return(
      <form className="playlist_manager--songlist_form" onSubmit={this.createPlaylist.bind(this)} >
        <div className="playlist_manager--form_part">
          <label htmlFor="playlist_name">Playlist Name</label>
          <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" pattern="[a-zA-Z0-9- _]+"/>
        </div>
        <div className="playlist_manager--form_part">
          <label htmlFor="playlist_length">Number of Songs</label>
          <input name="playlist_length" id="playlist_length" type="number" size="10" maxLength="3" />
        </div>
        <div className="playlist_manager--form_part">
          <label htmlFor="playlist_duration">Duration of polls (m)</label>
          <input name="playlist_duration" id="playlist_duration" type="number" size="10" maxLength="2" />
        </div>
        <button type="submit">Create playlist</button>
      </form>
    )
  }

  createPlaylist(event){
    event.preventDefault()
    name = document.getElementById("playlist_name").value
    length = document.getElementById("playlist_length").value
    duration = document.getElementById("playlist_duration").value
    if(!name || !length || !duration){
      alert("Please complete all the fields!")
      return null
    }else if(length < 1 || duration < 1){
      alert("Please use valid choiches!")
      return null
    }
    playlist =  {
      "name": name,
      "length": parseInt(length),
      "duration": parseInt(duration),
      "public": true
    }
    Meteor.call("loggedUsers.addPlaylist", this.props.userId, playlist, function(error, result){
      if(result){
        alert("SonglistCreated!")
      }else{
        console.log(error)
        console.log(result)
      }
    })
  }

  clickOnPlaylist(playlist){
    this.setState({currentPlaylist: playlist})
  }
}
