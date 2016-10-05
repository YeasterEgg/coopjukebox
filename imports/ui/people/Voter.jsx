import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import TrackList from '../common/TrackList.jsx'
import Waiter from '../common/Waiter.jsx'
import PageNotFound from '../common/PageNotFound.jsx'
import { Songlists } from '../../api/songlists.js'

export default class Voter extends Component {

  constructor(props){
    super(props)
    this.state = {
      voted: false
    }
  }

  componentWillMount(){
    songlistsVoted = JSON.parse(localStorage.getItem("songlistVotedFor"))
    if(!songlistsVoted){return null}
    if(songlistsVoted[this.props.params.songlistRndmId]){
      console.log('Hey you, your worthless choice has already been made, you\'re outliving your usefulness!')
      this.setState({voted: songlistsVoted[this.props.params.songlistRndmId]})
    }
  }

  render(){
    if(!this.props.subscription){
      return(
        <Waiter />
      )
    }else if(!this.props.songlist){
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
    tracks = Object.values(this.props.songlist[0].possibleChoices)
    randomTracks = _.sample(tracks, this.props.songlist[0].poolSize)
    if(!this.state.voted){
      return (
        <TrackList tracks={randomTracks} clickOnTrackAction={this.addVoteToTrack.bind(this)}/>
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
    Meteor.call("addVoteToTrack", this.props.songlist[0]._id, track, function(error, result){
      if(!error){
        console.log("Thanks for your game-changing vote, subhuman.")
        currentVoted = JSON.parse(localStorage.getItem("songlistVotedFor")) || {}
        currentVoted[this.props.params.songlistRndmId] = track.spotifyId
        localStorage.setItem("songlistVotedFor", JSON.stringify(currentVoted))
        this.setState({voted: track.spotifyId})
      }
    }.bind(this))
  }
}

export default createContainer((props) => {

  songlistRndmId = props.params.songlistRndmId
  const songlistSubscription = Meteor.subscribe('songlistFromSonglistRndmId', songlistRndmId)

  return {
    songlist: Songlists.find().fetch(),
    subscription: songlistSubscription.ready()
  }
}, Voter)


