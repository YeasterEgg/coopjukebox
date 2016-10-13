import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import TrackSearcher from '../common/TrackSearcher.jsx'

cf = require('../../lib/commonFunctions.js')
config = require('../../lib/config.js')
querystring = require('querystring')

export default class SpotifyTrackImporter extends Component {

  render(){
    return (
      <div>
        {this.renderImportPlaylistButton()}
        <TrackSearcher clickOnTrackAction={this.addTrackToSonglist.bind(this)} limit="30" />
      </div>
    )
  }

  renderImportPlaylistButton(){
    return(
      <form className="playlist_manager--add_playlist" onSubmit={this.importPlaylist.bind(this)} >
        <label htmlFor="playlist_id">Import playlist from ID or SpotifyUri</label>
        <input name="playlist_id" id="playlist_id" type="text" size="20" maxLength="70"/>
        <button type="submit">Import Playlist</button>
      </form>
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
