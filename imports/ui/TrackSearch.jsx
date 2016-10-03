import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'
import Track from './Track.jsx'

export default class TrackSearch extends Component {

  render(){
    return(
      <div className="homepage--tracksearch">
        {this.props.tracks.map(function(track){
          return(
            <Track track={track} key={track.id} clickOnTrack={this.props.addTrackToPoll.bind(this)}/>
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

TrackSearch.propTypes = {
  tracks: PropTypes.array.isRequired,
  addTrackToPoll: PropTypes.func.isRequired
}
