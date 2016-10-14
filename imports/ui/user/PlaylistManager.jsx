import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import SpotifyHeader from './SpotifyHeader.jsx'
import SpotifyTrackImporter from './SpotifyTrackImporter.jsx'

import { Polls } from '../../api/polls.js'

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export default class PlaylistManager extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      notice: false,
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
        {this.renderPollCommands()}
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
          <SpotifyTrackImporter playlist={this.props.playlist} setNotice={this.setNotice.bind(this)}/>
          {this.renderSonglist()}
        </div>
      )
    }else{
      return null
    }
  }

  renderPollCommands(){
    if(this.props.poll){
      return(
        <div className="playlist_manager--poll">
          <button type="submit" className="playlist_manager--start_poll button-round pure-button button-error pure-button-disabled" onClick={function(){console.log('Active Polls!')}} disabled>There are polls still ongoing!</button>
          {this.renderPollStatus()}
          <div className="playlist_manager--chosen_container">
            {this.renderTracksChosen()}
          </div>
        </div>
      )
    }else{
      return(
        <div className="playlist_manager--poll">
          <div className="playlist_manager--form_part">
            <label htmlFor="poll_size">Poll Size</label>
            <input name="poll_size" id="poll_size" type="number" size="20" maxLength="3" min="2" max="6" step="1" defaultValue="2"/>
          </div>
          <div className="playlist_manager--form_part">
            <label htmlFor="poll_number">Number of consecutive Polls</label>
            <input name="poll_number" id="poll_number" type="number" size="20" maxLength="3" min="2" max="12" step="1" defaultValue="2"/>
          </div>
          <button type="submit" className="playlist_manager--start_poll button-round pure-button pure-button-primary" onClick={this.startVoting.bind(this)}>Start Voting!</button>
        </div>
      )
    }
  }

  renderPollStatus(){
    return(
      Object.values(this.props.poll.availableChoices).map(function(track){
        return(
          <div className="playlist_manager--poll_track" key={track.spotifyId}>
            <span className="playlist_manager--poll_track_name">{track.name + " : " + track.votes}</span>
          </div>
        )
      })
    )
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

  renderTracksChosen(){
    return(
      <div className="playlist_manager--chosen_container">
        <div className="playlist_manager--chosen_container_title">
          <span>Tracks Added by Users</span>
        </div>
        <div className="playlist_manager--chosen_container_songlist">
          {Object.values(this.props.poll.votersChoices).map(function(track){
            return(
              <div className="playlist_manager--chosen_track" key={track.spotifyId}>
                <span className="playlist_manager--chosen_track_name">{track.name}</span>
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

  startVoting(){
    size = document.getElementById("poll_size").value
    number = document.getElementById("poll_number").value
    console.log('nope!')
    Meteor.call("poll.startPoll", this.props.playlist, size, number, function(error, result){
      if(result){
        this.setNotice(result)
      }
    }.bind(this))
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
