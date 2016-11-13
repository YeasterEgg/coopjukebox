import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import TrackSearcher from '../common/TrackSearcher.jsx'
import CoolDropdown from '../common/CoolDropdown.jsx'

export default class SpotifyTrackImporter extends Component {

  render(){
    return (
      <div>
        {this.renderImportPlaylistButton()}
        {this.renderImportUserPlaylistButton()}
        <TrackSearcher clickOnTrackAction={this.addTrackToSonglist.bind(this)} limit="30" />
      </div>
    )
  }

  renderImportPlaylistButton(){
    return(
      <form className="playlist_manager--add_playlist" onSubmit={this.importPlaylist.bind(this)} >
        <label htmlFor="playlist_id">Import songs from playlist using SpotifyUri</label>
        <input name="playlist_id" id="playlist_id" type="text" size="20" maxLength="70"/>
        <button type="submit">Import Playlist</button>
      </form>
    )
  }

  renderImportUserPlaylistButton(){
    options = []
    this.props.playlists.map(function(playlist){
      options.push({
        value: playlist.id + "-$-" + playlist.owner.id,
        text: playlist.name,
      })
    })
    return(
      <CoolDropdown classes="playlist_manager--add_user_playlist" onSubmit={this.importUserPlaylist.bind(this)} inputName="user_playlist_id" submit="Import Playlist" label="Import songs from one of your playlists" options={options}/>
    )
  }

  importPlaylist(event){
    event.preventDefault()
    uri = document.getElementById('playlist_id').value.split(":")
    if(uri.length != 5) return false
    importedUserId = uri[2]
    importedPlaylistSpotifyId = uri[4]
    Meteor.call("playlist.importPlaylist", importedPlaylistSpotifyId, importedUserId, this.props.playlist, function(error, result){
      tracksNo = result.items.length
      this.props.setNotice({text: "Imported " + tracksNo + " songs from playlist!", kind: "success"})
      document.getElementById('playlist_id').value = ''
    }.bind(this))
  }

  importUserPlaylist(event){
    event.preventDefault()
    value = document.getElementById('user_playlist_id').value
    importedPlaylistSpotifyId = value.split("-$-")[0]
    importedUserId = value.split("-$-")[1]
    Meteor.call("playlist.importPlaylist", importedPlaylistSpotifyId, importedUserId, this.props.playlist, function(error, result){
      tracksNo = result.items.length
      this.props.setNotice({text: "Imported " + tracksNo + " songs from playlist!", kind: "success"})
      document.getElementById('playlist_id').value = ''
    }.bind(this))
  }

  addTrackToSonglist(track){
    playlist = this.props.playlist
    Meteor.call("playlist.addTrackToSonglist", playlist, track, function(error, result){
      if(!error && result){
        this.props.setNotice({text: "Added " + track.name + " to Songlist!", kind: "success"})
        return true
      }
    }.bind(this))
  }
}

SpotifyTrackImporter.propTypes = {
  playlist: PropTypes.object.isRequired,
}
