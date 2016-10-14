import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class Info extends Component {

  render(){
    return(
      <div className="info--container">
        {this.renderInfo()}
      </div>
    )
  }

  renderInfo(){
    return(
      null
    )
  }

}
