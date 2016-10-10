import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { createContainer } from 'meteor/react-meteor-data'

import SpotifyHeader from './SpotifyHeader.jsx'
import SpotifyTrackImporter from './SpotifyTrackImporter.jsx'
import Waiter from '../common/Waiter.jsx'
import TrackList from '../common/TrackList.jsx'

import { Polls } from '../../api/polls.js'

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
cf = require('../../lib/commonFunctions.js')
config = require('../../lib/config.js')
querystring = require('querystring')

export default class PlaylistManager extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      positiveNotice: false,
    }
  }

  render(){
    return (
      <div className="playlist_manager--container">
        <div className="playlist_manager--close_songlist">X</div>
        <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.renderPositiveNotice()}
        </ReactCSSTransitionGroup>
        <SpotifyHeader playlist={this.props.playlist} />
        {this.renderPollCommands()}
        <div className="playlist_manager--songlist_container">
          <SpotifyTrackImporter playlist={this.props.playlist} setPositiveNotice={this.setPositiveNotice.bind(this)}/>
          {this.renderSonglist()}
        </div>
      </div>
    )
  }

  renderPositiveNotice(){
    if(this.state.positiveNotice){
      return(
        <div className="playlist_manager--track_added_notice button-success">{this.state.positiveNotice}</div>
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
        </div>
      )
    }else{
      return(
        <button type="submit" className="playlist_manager--start_poll button-round pure-button pure-button-primary" onClick={this.startVoting.bind(this)}>Start Voting!</button>
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

  renderExportSonglist(){
    list = _.pluck(this.props.playlist.songlist, "spotifyId").join("/n")
    return(
      <a className="playlist_manager--songlist_export" href={"data:application/octet-stream," + encodeURIComponent(list)} >Export Songlist</a>
    )
  }

  startVoting(){
    Meteor.call("poll.startPoll", this.props.playlist, function(error, result){
      if(result){
        this.setPositiveNotice("Voting started! Yahoo Democracy!")
      }
    }.bind(this))
  }

  removeFromSonglist(track){
    Meteor.call("playlist.removeTrackFromSonglist", this.props.playlist, track, function(error, result){
      if(result){
        this.setPositiveNotice("Removed " + track.name + "!")
      }
    }.bind(this))
  }

  setPositiveNotice(notice){
    setTimeout(function(){
      this.setState({positiveNotice: false})
    }.bind(this), 3000)
    this.setState({"positiveNotice": notice})
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
