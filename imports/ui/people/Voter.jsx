import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

import TrackList from '../common/TrackList.jsx'
import Waiter from '../common/Waiter.jsx'
import CountDown from './CountDown.jsx'
import VoterVote from './VoterVote.jsx'
import VoterPropose from './VoterPropose.jsx'
import PageNotFound from '../common/PageNotFound.jsx'
import TrackSearcher from '../common/TrackSearcher.jsx'

import { Polls } from '../../api/polls.js'

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false,
      action: false,
    }
  }

  checkIfVoted(){
    pollUniqId = this.props.poll._id + "_" + this.props.poll.pollsLeft
    pollsVoted = JSON.parse(localStorage.songlistVotedFor)
    if(!pollsVoted){return false}
    if(pollsVoted[pollUniqId]){
      console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
      this.setState({voted: pollsVoted[pollUniqId]})
      return true
    }else{
      return false
    }
  }

  render(){
    pollsVoted = JSON.parse(localStorage.songlistVotedFor)
    pollUniqId = this.props.poll._id + "_" + this.props.poll.pollsLeft
    if(!this.props.subscription){
      return(
        <Waiter />
      )
    }else if(!this.props.poll){
      return(
        <PageNotFound />
      )
    }else if(this.checkIfVoted.bind(this)){
      return(
        <div>{this.renderVotedFor(pollsVoted[pollUniqId])}</div>
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
    src = "https://embed.spotify.com/?uri=spotify:track:" + track
    return(
      <div className="voter--voter_container">
        <div className="voter--voter_title">Now, listen to what you have chosen!</div>
        <iframe src={src} width="300" height="380" frameBorder="0" allowTransparency="true"></iframe>
      </div>
    )
  }

  addVoteToTrack(track){
    Meteor.call("poll.addVoteToTrack", this.props.poll, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
        this.setPollAsVoted(track).bind(this)
      }else{
        console.log(error)
      }
    }.bind(this))
  }

  addTrackToVoterChoices(track){
    Meteor.call("poll.addTrackToVoterChoices", this.props.poll, track, function(error, result){
      if(!error){
        console.log("Thanks for your choice.")
        this.setPollAsVoted(track).bind(this)
        return true
      }
    }.bind(this))
  }

  setPollAsVoted(track){
    console.log(track)
    console.log(this)
    pollUniqId = this.props.poll._id + "_" + this.props.poll.pollsLeft
    alreadyVoted = JSON.parse(localStorage.getItem("songlistVotedFor")) || {}
    alreadyVoted[pollUniqId] = track.spotifyId
    localStorage.setItem("songlistVotedFor", JSON.stringify(alreadyVoted))
    this.setState({voted: track.spotifyId})
  }
}

export default createContainer((props) => {

  const pollSubscription = Meteor.subscribe('polls.fromChosenName', props.chosenName)

  return {
    poll: Polls.findOne(),
    subscription: pollSubscription.ready()
  }
}, Voter)


