import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

export default class CoolDropdown extends Component {

  render(){
    return(
      <form className={this.props.classes} onSubmit={this.props.onSubmit.bind(this)} >
        <label htmlFor={this.props.inputName}>{this.props.label}</label>
        <select id={this.props.inputName}>
          {this.props.options.map(function(option){
            return(
              <option value={option.value} key={option.value}>{option.text}</option>
            )
          })}
        </select>
        <button type="submit">{this.props.submit}</button>
      </form>
    )
  }
}
