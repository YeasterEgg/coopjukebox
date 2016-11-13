import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import SpotifyHeader from './SpotifyHeader.jsx'
import SpotifyTrackImporter from './SpotifyTrackImporter.jsx'
import PollCommands from './PollCommands.jsx'

import { Polls } from '../../api/polls.js'

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class PlaylistManager extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      notice: false,
      stopped: false
    }
  }

  render(){
    return (
      <div className="playlist_manager--container">
        <div className="playlist_manager--close_songlist" onClick={this.props.closePlaylist.bind(this)}>X</div>
        <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.renderNotice()}
        </ReactCSSTransitionGroup>
        <SpotifyHeader playlist={this.props.playlist} />
        <PollCommands poll={this.props.poll} playlist={this.props.playlist} setNotice={this.setNotice.bind(this)} />
        {this.renderSonglistCommands()}
      </div>
    )
  }

  renderNotice(){
    if(this.state.notice){
      return(
        <div className={"playlist_manager--track_added_notice button-" + this.state.notice.kind}>{this.state.notice.text}</div>
      )
    }else{
      return null
    }
  }

  renderSonglistCommands(){
    if(!this.props.poll){
      return(
        <div className="playlist_manager--songlist_container">
          <SpotifyTrackImporter playlist={this.props.playlist} setNotice={this.setNotice.bind(this)} playlists={this.props.user.playlists} />
          {this.renderSonglist()}
        </div>
      )
    }else{
      return null
    }
  }

  renderSonglist(){
    return(
      <div className="playlist_manager--songlist_container">
        <div className="playlist_manager--songlist_container_title">
          <span>Songlist</span>
          {this.renderExportSonglist()}
        </div>
        <div className="playlist_manager--songlist_container_songlist">
          {Object.values(this.props.playlist.songlist).map(function(track){
            return(
              <div className="playlist_manager--songlist_track" key={track.spotifyId}>
                <span className="playlist_manager--songlist_track_name">{track.name}</span>
                <span className="playlist_manager--songlist_track_delete" onClick={function(){this.removeFromSonglist(track)}.bind(this)}>X</span>
              </div>
            )
          }.bind(this))}
        </div>
      </div>
    )
  }

  renderExportSonglist(){
    list = _.pluck(this.props.playlist.songlist, "spotifyId").join("/n")
    return(
      <a className="playlist_manager--songlist_export" href={"data:application/octet-stream," + encodeURIComponent(list)} >Export Songlist</a>
    )
  }

  removeFromSonglist(track){
    Meteor.call("playlist.removeTrackFromSonglist", this.props.playlist, track, function(error, result){
      if(result){
        this.setNotice({text: "Removed " + track.name + "!", kind: "success"})
      }
    }.bind(this))
  }

  setNotice(notice){
    Meteor.setTimeout(function(){
      this.setState({notice: false})
    }.bind(this), 3000)
    this.setState({notice: notice})
  }
}

PlaylistManager.propTypes = {
  playlist: PropTypes.object.isRequired,
}

export default createContainer((props) => {

  const pollSubscription = Meteor.subscribe('polls.fromPlaylistId', props.playlist._id)

  return {
    poll: Polls.findOne(),
    subscription: pollSubscription.ready()
  }
}, PlaylistManager)
