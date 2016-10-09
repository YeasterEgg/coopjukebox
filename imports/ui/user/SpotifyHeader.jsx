import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class SpotifyHeader extends Component {
  render(){
    return(
      <div className="playlist_creator--spotify_header">
        <div className="playlist_creator--playlist_link">
          <iframe src={"https://embed.spotify.com/?uri=spotify:user:" + this.props.playlist.userId + ":playlist:" + this.props.playlist._id} width="300" height="80" frameBorder="0" allowTransparency="true"></iframe>
        </div>
        <div className="playlist_creator--playlist_link">
          <label>Link for Voting</label>
          <a href={Meteor.absoluteUrl() + this.props.playlist.chosenName}> {Meteor.absoluteUrl() + this.props.playlist.chosenName} </a>
        </div>
      </div>
    )
  }
}

SpotifyHeader.propTypes = {
  playlist: PropTypes.object.isRequired,
}
