import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class Waiter extends Component {
  render(){
    return(
      <div className="loader--container">
        <div className="loader--dots">
          {"{"}<span>♫</span><span>♩</span><span>♬</span>{"}"}
        </div>
      </div>
    )
  }
}
