import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class Info extends Component {

  render(){
    return(
      <div className="info--container">
        <div className="info--text">
          <h1 className="info--title"></h1>
          <h3 className="info--list">1 - First Steps</h3>
          <p></p>
          <h3 className="info--list">2 - Fill a Songlist</h3>
          <p></p>
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
          <p></p>
          <h3 className="info--list">4 - Poll End</h3>
          <p></p>
        </div>
      </div>
    )
  }

}
