import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from './Track.jsx'
import { Polls } from '../api/polls.js'

export default class TrackList extends Component {

  render(){
    return(
      <div className="voter_page--tracklist_container">
        {Object.values(this.props.tracks).map(function(track){
          return(
            <Track track={track} key={track.spotifyId} clickOnTrack={this.props.addVoteToTrack.bind(this)}/>
          )
        }.bind(this))}
      </div>
    )
  }

  renderTrack(track){
    return(
      <div>{track.name}</div>
    )
  }


}

TrackList.propTypes = {
  tracks: PropTypes.object.isRequired,
  addVoteToTrack: PropTypes.func.isRequired
}

export default createContainer((props) => {
  const pollTrackListSubscription = Meteor.subscribe('pollTrackList', props.pollId)
  poll = Polls.find().fetch()[0]
  if(poll){
    tracks = poll.possibleChoices
  }else{
    tracks = {}
  }
  console.log(tracks)
  return {
    tracks: tracks,
    subscription: pollTrackListSubscription.ready(),
  }
}, TrackList)

