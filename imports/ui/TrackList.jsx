import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from './Track.jsx'
import { Polls } from '../api/polls.js'

export default class TrackList extends Component {

  render(){
    return(
      <table className="pure-table voter_page--tracklist_container">
        <tbody>
          <tr>
            {this.props.tracks.map(function(track, index){
              if(index%5 == 0){
                return(
                  <td>
                    <Track track={track} key={track.id} addTrackToPoll={function(){console.log('ciao')}}/>
                  </td>
                )
              }
            }.bind(this))}
          </tr>
        </tbody>
      </table>
    )
  }

  renderTrack(track){
    return(
      <div>{track.name}</div>
    )
  }


}

TrackList.propTypes = {
  tracks: PropTypes.array.isRequired,
}

export default createContainer((props) => {
  const pollTrackListSubscription = Meteor.subscribe('pollTrackList', props.pollId)
  poll = Polls.find().fetch()[0]
  if(poll){
    tracks = poll.possibleChoices
  }else{
    tracks = []
  }

  return {
    tracks: tracks,
    subscription: pollTrackListSubscription.ready()
  }
}, TrackList)

