import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackList from '../common/TrackList.jsx'
import Waiter from '../common/Waiter.jsx'

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false,
      songlistExists: false
    }
  }

  componentWillMount(){
    Meteor.call("userFromSonglistRndmId", this.props.params.songlistRndmId, function(error, result){
      if(!error){
        this.setState({songlistExists: true})
      }
    }.bind(this))

    songlistsVoted = JSON.parse(localStorage.getItem("songlistifierVotedFor"))
    if(!songlistsVoted){return null}
    if(songlistsVoted[this.props.params.songlistRndmId]){
      console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
      this.setState({voted: songlistsVoted[this.props.params.songlistRndmId]})
    }
  }

  render(){
    if(this.state.songlistExists){
      return(
        <div>{this.renderPage()}</div>
      )
    }else{
      return(
        <Waiter />
      )
    }
  }

  renderPage(){
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
        <TrackList tracks={[]} clickOnTrackAction={this.addVoteToTrack.bind(this)}/>
      )
    }
  }

  addVoteToTrack(track){
    Meteor.call("addVoteToTrack", this.props.params.songlistRndmId, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
        currentVoted = JSON.parse(localStorage.getItem("songlistifierVotedFor")) || {}
        currentVoted[this.props.params.songlistRndmId] = track.spotifyId
        localStorage.setItem("songlistifierVotedFor", JSON.stringify(currentVoted))
        this.setState({voted: track.spotifyId})
      }
    }.bind(this))
  }
}

export default createContainer((props) => {
  const spotifyRndmId
  const usersSubscription = Meteor.subscribe('loggedUsers')

  return {
    users: LoggedUsers.find().fetch(),
    subscription: usersSubscription.ready()
  }
}, SonglistCreator)

