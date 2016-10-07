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
      pollStarted: this.props.songlist.startedAt
    }
  }

  render(){
    return (
      <div>
        <ReactCSSTransitionGroup transitionName="fadeInFadeOut" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          {this.renderPositiveNotice()}
        </ReactCSSTransitionGroup>
        <SpotifyHeader songlist={this.props.songlist} />
        {this.renderStartButton()}
        <SpotifyTrackImporter songlist={this.props.songlist} setPositiveNotice={this.setPositiveNotice.bind(this)}/>
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
    if(this.props.poll[0]){
      return(
        <button type="submit" className="songlist_creator--start_poll button-round pure-button button-error pure-button-disabled" onClick={function(){console.log('Active Polls!')}} disabled>There are polls still ongoing!</button>
      )
    }else{
      return(
        <button type="submit" className="songlist_creator--start_poll button-round pure-button pure-button-primary" onClick={this.startVoting.bind(this)}>Start Voting!</button>
      )
    }
  }

  startVoting(){
    songlistRndmId = this.props.songlist.songlistRndmId
    Meteor.call("startSonglistPoll", songlistRndmId, function(error, result){
      if(result){
        this.setState({pollStarted: result})
        this.setPositiveNotice("Voting started! Yahoo Democracy!")
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

SonglistManager.propTypes = {
  songlist: PropTypes.object.isRequired,
}

export default createContainer((props) => {

  songlistRndmId = props.songlist.songlistRndmId
  const pollSubscription = Meteor.subscribe('pollFromSonglistRndmId', songlistRndmId)

  return {
    poll: Polls.find().fetch(),
    subscription: pollSubscription.ready()
  }
}, SonglistManager)


