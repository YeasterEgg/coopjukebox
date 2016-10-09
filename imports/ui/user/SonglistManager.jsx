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

export default class SonglistManager extends Component {

  constructor(props){
    super(props)
    this.state = {
      searchResult: [],
      positiveNotice: false,
      // pollStarted: this.props.poll.startedAt
    }
  }

  render(){
    return (
      <div>
        <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.renderPositiveNotice()}
        </ReactCSSTransitionGroup>
        <SpotifyHeader playlist={this.props.playlist} />
        {this.renderStartButton()}
        <SpotifyTrackImporter playlist={this.props.playlist} setPositiveNotice={this.setPositiveNotice.bind(this)}/>
        {this.renderSonglist()}
      </div>
    )
  }

  renderPositiveNotice(){
    if(this.state.positiveNotice){
      return(
        <div className="songlist_creator--track_added_notice button-success">{this.state.positiveNotice}</div>
      )
    }else{
      return null
    }
  }

  renderStartButton(){
    if(this.props.poll){
      return(
        <button type="submit" className="songlist_creator--start_poll button-round pure-button button-error pure-button-disabled" onClick={function(){console.log('Active Polls!')}} disabled>There are polls still ongoing!</button>
      )
    }else{
      return(
        <button type="submit" className="songlist_creator--start_poll button-round pure-button pure-button-primary" onClick={this.startVoting.bind(this)}>Start Voting!</button>
      )
    }
  }

  renderSonglist(){
    return(
      <div className="songlist_creator--songlist_container">
        {Object.values(this.props.playlist.songlist).map(function(track){
          return(
            <div className="songlist_creator--songlist_track" key={track.spotifyId}>
              <span className="songlist_creator--songlist_track_name">{track.name}</span>
              <span className="songlist_creator--songlist_track_delete" onClick={function(){this.removeFromSonglist(track)}.bind(this)}>X</span>
            </div>
          )
        }.bind(this))}
      </div>
    )
  }

  startVoting(){
    Meteor.call("poll.startPoll", this.props.playlist, function(error, result){
      if(result){
        this.setState({pollStarted: result})
        this.setPositiveNotice("Voting started! Yahoo Democracy!")
      }
    }.bind(this))
  }

  removeFromSonglist(track){
    Meteor.call("playlist.removeTrackFromSonglist", this.props.playlist, track, function(error, result){
      console.log(error)
      console.log(result)
    })
  }

  setPositiveNotice(notice){
    setTimeout(function(){
      this.setState({positiveNotice: false})
    }.bind(this), 3000)
    this.setState({"positiveNotice": notice})
  }
}

SonglistManager.propTypes = {
  playlist: PropTypes.object.isRequired,
}

export default createContainer((props) => {

  const pollSubscription = Meteor.subscribe('polls.fromPlaylistId', props.playlist._id)

  return {
    poll: Polls.findOne(),
    subscription: pollSubscription.ready()
  }
}, SonglistManager)
