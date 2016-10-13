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

  componentWillMount(){
    // if(!pollsVoted){return null}
    // if(pollsVoted[this.props.poll._id]){
    //   console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
    //   this.setState({voted: pollsVoted[this.props.poll._id]})
    // }
  }

  render(){
    pollsVoted = JSON.parse(localStorage.getItem("songlistVotedFor"))
    if(!this.props.subscription){
      return(
        <Waiter />
      )
    }else if(!this.props.poll){
      return(
        <PageNotFound />
      )
    }else if(pollsVoted && pollsVoted[this.props.poll._id]){
      return(
        <div>{this.renderVotedFor(pollsVoted[this.props.poll._id])}</div>
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
        currentVoted = JSON.parse(localStorage.getItem("songlistVotedFor")) || {}
        currentVoted[this.props.chosenName] = track.spotifyId
        localStorage.setItem("songlistVotedFor", JSON.stringify(currentVoted))
      }else{
        console.log(error)
      }
    }.bind(this))
  }

  addTrackToVoterChoices(track){
    Meteor.call("poll.addTrackToVoterChoices", this.props.poll, track, function(error, result){
      if(!error){
        console.log("Thanks for your choice.")
        return true
      }
    })
  }
}

export default createContainer((props) => {

  const pollSubscription = Meteor.subscribe('polls.fromChosenName', props.chosenName)

  return {
    poll: Polls.findOne(),
    subscription: pollSubscription.ready()
  }
}, Voter)


