import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import TrackList from '../common/TrackList.jsx'
import CountDown from './CountDown.jsx'
import VoterVote from './VoterVote.jsx'
import VoterPropose from './VoterPropose.jsx'

config = require('../../lib/config.js')

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false,
      action: false,
    }
  }

  componentWillMount(){
    if(!localStorage.pollsVoted) return false
    pollsVoted = JSON.parse(localStorage.pollsVoted)
    pollUniqId = this.props.poll._id + "_" + this.props.poll.pollsLeft
    if(pollsVoted[pollUniqId]){
      this.setState({voted: pollsVoted[pollUniqId]})
      return true
    }else{
      return false
    }
  }

  render(){
    if(this.state.voted){
      return(
        <div>{this.renderVotedFor(this.state.voted)}</div>
      )
    }else{
      return(
        <div>{this.renderPage()}</div>
      )
    }
  }

  renderPage(){
    return (
      <div className="voter--voter_container">
        <CountDown endingTime={this.props.poll.closesAt} />
        {this.renderContent()}
      </div>
    )
  }

  renderContent(){
    tracks = Object.values(this.props.poll.availableChoices)
    if(this.state.action === "vote"){
      return(
        <VoterVote tracks={tracks} clickOnTrackAction={this.addVoteToTrack.bind(this)} />
      )
    }else if(this.state.action === "propose"){
      return(
        <VoterPropose clickOnTrackAction={this.addTrackToVoterChoices.bind(this)} />
      )
    }else{
      return(
        <div className="voter--buttons">
          <button className="voter--button voter--button_vote" onClick={function(){this.setState({action: "vote"})}.bind(this)}>Vote a Song</button>
          <button className="voter--button voter--button_propose" onClick={function(){this.setState({action: "propose"})}.bind(this)}>Propose a Song</button>
        </div>
      )
    }
  }

  renderVotedFor(track){
    src = config.embeddedTrackUrl + track
    return(
      <div className="voter--voter_container">
        <CountDown endingTime={this.props.poll.closesAt} />
        <div className="voter--voter_title">Now, listen to what you have chosen!</div>
        <iframe src={src} width="300" height="380" frameBorder="0" allowTransparency="true"></iframe>
      </div>
    )
  }

  addVoteToTrack(track){
    this.setPollAsVoted(track)
    Meteor.call("poll.addVoteToTrack", this.props.poll, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
      }else{
        // this.setState({voted: false})
      }
    }.bind(this))
  }

  addTrackToVoterChoices(track){
    this.setPollAsVoted(track)
    Meteor.call("poll.addTrackToVoterChoices", this.props.poll, track, function(error, result){
      if(!error){
        console.log("Thanks for your choice.")
      }else{
        // this.setState({voted: false})
      }
    }.bind(this))
  }

  setPollAsVoted(track){
    pollUniqId = this.props.poll._id + "_" + this.props.poll.pollsLeft
    if(localStorage.pollsVoted){
      pollsVoted = JSON.parse(localStorage.pollsVoted)
    }else{
      pollsVoted = {}
    }
    pollsVoted[pollUniqId] = track.spotifyId
    localStorage.pollsVoted = JSON.stringify(pollsVoted)
    this.setState({voted: track.spotifyId})
  }
}
