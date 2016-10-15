import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class Info extends Component {

  render(){
    return(
      <div className="info--container">
        <div className="info--text">
          <h1 className="info--title">How to use:</h1>
          <h3 className="info--list">1 - First Steps</h3>
          <p>First thing, you need to authenticate with your spotify account. That will give the app the rights to create and update a Spotify Playlist.&nbsp;When that is done, you can create a Spotify Playlist (or access one you have already created before).</p>
          <h3 className="info--list">2 - Fill a Songlist</h3>
          <p>Each Spotify Playlist will be paired to a Songlist you need to fill in 3 ways:</p>
          <ul>
            <li>
              <p>Import Spotify Playlists via their URI</p>
            </li>
            <li>
              <p>Import single track via Search Engine</p>
            </li>
            <li>
              <p>Import songlists from other Spotify Playlists you have previously exported (array of URI, actually)</p>
            </li>
          </ul>
          <p>Once the Songlist is prepared, you can set up a poll and start it. A poll needs a number of possible choices (2~6) and the number of times it will be repeated (2~40).&nbsp;Once those fields are filled, you will be able to start the Poll.</p>
          <h3 className="info--list">3 - The Poll</h3>
          <p>Any user, even if it&#39;s not registered to Spotify, will be able to influence your Spotify Playlist from the link you will see on your page, with structure &quot;https://coop-jukebox.herokuapp.com/NAME_OF_PLAYLIST&quot;. He will be able either vote a track or add a track to the pool list, once for every turn.</p>
          <h3 className="info--list">4 - Poll End</h3>
          <p>At the end of the poll (whose duration is 5' for the first, and then as long as the previous winner) the track with more votes will be added to your Spotify Playlist.&nbsp;If there are any left, another poll will start, including half tracks from your songlist and half from user chosen tracks.</p>
        </div>
      </div>
    )
  }

}
