import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import CountDown from '../people/CountDown.jsx'


export default class PageNotFound extends Component {

  render(){
    endingTime = new Date(new Date - - 244500)
    return(
      <div className="page_notfound--container">
        <CountDown endingTime={endingTime} />
      </div>
    )
  }
}
