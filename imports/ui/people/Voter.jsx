import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackList from '../common/TrackList.jsx'
import Waiter from '../common/Waiter.jsx'
import PageNotFound from '../common/PageNotFound.jsx'
import { Polls } from '../../api/polls.js'

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false
    }
  }

  componentWillMount(){
    pollsVoted = JSON.parse(localStorage.getItem("songlistVotedFor"))
    if(!pollsVoted){return null}
    if(pollsVoted[this.props.poll._id]){
      console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
      this.setState({voted: pollsVoted[this.props.poll._id]})
    }
  }

  render(){
    if(!this.props.subscription){
      return(
        <Waiter />
      )
    }else if(!this.props.poll){
      return(
        <PageNotFound />
      )
    }else{
      return(
        <div>{this.renderPage()}</div>
      )
    }
  }

  renderPage(){
    tracks = Object.values(this.props.poll.availableChoices)
    if(!this.state.voted){
      return (
        <div className="voter--voter_tracklist">
          <TrackList tracks={tracks} clickOnTrackAction={this.addVoteToTrack.bind(this)} withVotes={true}/>
        </div>
      )
    }else{
      src = "https://embed.spotify.com/?uri=spotify:track:" + this.state.voted
      return(
        <div className="voter--voted_container">
          <div className="voter--voted_title">Now, listen to what you have chosen!</div>
          <iframe src={src} width="300" height="380" frameBorder="0" allowTransparency="true"></iframe>
        </div>
      )
    }
  }

  addVoteToTrack(track){
    Meteor.call("addVoteToTrack", this.props.poll.songlistRndmId, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
        currentVoted = JSON.parse(localStorage.getItem("songlistVotedFor")) || {}
        currentVoted[this.props.params.playlistLocalName] = track.spotifyId
        localStorage.setItem("songlistVotedFor", JSON.stringify(currentVoted))
        this.setState({voted: track.spotifyId})
      }
    }.bind(this))
  }
}

export default createContainer((props) => {

  const pollSubscription = Meteor.subscribe('polls.fromChosenName', props.chosenName)

  return {
    poll: Polls.findOne(),
    subscription: pollSubscription.ready()
  }
}, Voter)


