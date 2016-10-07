import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class SpotifyHeader extends Component {
  render(){
    return(
      <div className="songlist_creator--spotify_header">
        <div className="songlist_creator--playlist_link">
          <iframe src={"https://embed.spotify.com/?uri=spotify:user:" + this.props.songlist.userSpotifyId + ":playlist:" + this.props.songlist.playlistSpotifyId} width="300" height="80" frameBorder="0" allowTransparency="true"></iframe>
        </div>
        <div className="songlist_creator--songlist_link">
          <label>Link for Voting</label>
          <a href={Meteor.absoluteUrl() + "sl/" + this.props.songlist.songlistRndmId}> {Meteor.absoluteUrl() + this.props.songlist.songlistRndmId} </a>
        </div>
      </div>
    )
  }
}

SpotifyHeader.propTypes = {
  songlist: PropTypes.object.isRequired,
}
