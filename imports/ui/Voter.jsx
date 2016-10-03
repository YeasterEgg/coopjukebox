import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackList from './TrackList.jsx'

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false,
    }
  }

  componentWillMount(){
    pollsVoted = JSON.parse(localStorage.getItem("pollifierVotedFor"))
    if(!pollsVoted){return null}
    if(pollsVoted[this.props.params.pollId]){
      console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
      this.setState({voted: pollsVoted[this.props.params.pollId]})
    }
  }

  render(){
    if(this.state.voted){
      src = "https://embed.spotify.com/?uri=spotify:track:" + this.state.voted
      return(
        <div className="voter--voted_container">
          <div className="voter--voted_title">Now, listen to what you have chosen!</div>
          <iframe src={src} width="300" height="380" frameborder="0" allowtransparency="true"></iframe>
        </div>
      )
    }else{
      return (
        <TrackList pollId={this.props.params.pollId} addVoteToTrack={this.addVoteToTrack.bind(this)}/>
      )
    }
  }

  addVoteToTrack(track){
    Meteor.call("addVoteToTrack", this.props.params.pollId, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
        currentVoted = JSON.parse(localStorage.getItem("pollifierVotedFor")) || {}
        currentVoted[this.props.params.pollId] = track.spotifyId
        localStorage.setItem("pollifierVotedFor", JSON.stringify(currentVoted))
        this.setState({voted: track.spotifyId})
      }
    }.bind(this))
  }
}
