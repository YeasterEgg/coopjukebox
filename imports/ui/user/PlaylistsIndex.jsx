import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import PlaylistManager from './PlaylistManager.jsx'
import Waiter from '../common/Waiter.jsx'

import { Playlists } from '../../api/playlists.js'

export default class PlaylistsIndex extends Component {

  constructor(props){
    super(props)
    this.state = {
      currentPlaylistIndex: false,
    }
  }

  render(){
    if(this.state.currentPlaylistIndex === false){
      return(
        <div>{this.renderPlaylistIndex()}</div>
      )
    }else{
      return(
        <PlaylistManager playlist={this.props.playlists[this.state.currentPlaylistIndex]} user={this.props.user} />
      )
    }
  }

  renderPlaylistIndex(){
    if(this.props.playlists.length > 0){
      return(
        <div className="playlists_index--playlist_index">
          <ul>
          {this.props.playlists.map(function(playlist, index){
            return(
              <li key={playlist._id} onClick={function(){this.clickOnPlaylist.bind(this)(index)}.bind(this)}>
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
        <div className="playlists_index--playlist_index">
          {this.renderNewPlaylistForm()}
        </div>
      )
    }
  }

  renderNewPlaylistForm(){
    return(
      <form className="playlists_index--songlist_form" onSubmit={this.createPlaylist.bind(this)} >
        <div className="playlists_index--form_part">
          <label htmlFor="playlist_name">Playlist Name</label>
          <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" pattern="[a-zA-Z0-9- _]+"/>
        </div>
        <div className="playlists_index--form_part">
          <label htmlFor="playlist_length">Number of Songs</label>
          <input name="playlist_length" id="playlist_length" type="number" size="10" maxLength="3" />
        </div>
        <div className="playlists_index--form_part">
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
    Meteor.call("playlists.create", this.props.user, playlist, function(error, result){
      if(result){
        console.log("SonglistCreated!")
        document.getElementById("playlist_name").value = ''
        document.getElementById("playlist_length").value = ''
        document.getElementById("playlist_duration").value = ''
      }else{
        console.log(error)
      }
    })
  }

  clickOnPlaylist(index){
    this.setState({currentPlaylistIndex: index})
  }
}

PlaylistsIndex.propTypes = {
  user: PropTypes.object.isRequired,
}

export default createContainer((props) => {

  const playlistsSubscription = Meteor.subscribe('playlists.fromUserId', props.user._id)

  return {
    playlists: Playlists.find().fetch(),
    subscriptionsReady: playlistsSubscription.ready()
  }
}, PlaylistsIndex)
