import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import PlaylistManager from './PlaylistManager.jsx'

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
        <div>{this.renderPlaylistSummary()}</div>
      )
    }else{
      return(
        <PlaylistManager playlist={this.props.playlists[this.state.currentPlaylistIndex]} user={this.props.user} closePlaylist={this.closePlaylist.bind(this)}/>
      )
    }
  }

  renderPlaylistSummary(){
    return(
      <div className="playlists_index--container">
        {this.renderNewPlaylistForm()}
        {this.renderPlaylistIndex()}
      </div>
    )
  }

  renderPlaylistIndex(){
    return(
      <div className="playlists_index--playlist_index">
        {this.props.playlists.map(function(playlist, index){
          return(
            <p key={playlist._id} onClick={function(){this.clickOnPlaylist.bind(this)(index)}.bind(this)}>
              <span>{playlist.name}</span>
            </p>
          )
        }.bind(this))}
      </div>
    )
  }

  renderNewPlaylistForm(){
    return(
      <form className="playlists_index--songlist_form" onSubmit={this.createPlaylist.bind(this)} >
        <div className="playlists_index--form_part">
          <label htmlFor="playlist_name">Playlist Name</label>
          <input name="playlist_name" id="playlist_name" type="text" size="20" maxLength="50" pattern="[a-zA-Z0-9- _]+"/>
        </div>
        <button type="submit" className="button-round pure-button">Create playlist</button>
      </form>
    )
  }

  createPlaylist(event){
    event.preventDefault()
    name = document.getElementById("playlist_name").value
    if(!name){
      alert("Please complete all the fields!")
      return null
    }
    playlist =  {
      "name": name,
      "public": true
    }
    Meteor.call("playlists.create", this.props.user, playlist, function(error, result){
      if(result){
        document.getElementById("playlist_name").value = ''
      }
    })
  }

  clickOnPlaylist(index){
    this.setState({currentPlaylistIndex: index})
  }

  closePlaylist(){
    this.setState({currentPlaylistIndex: false})
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
