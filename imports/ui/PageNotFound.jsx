import React, { Component, PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import ReactDOM from 'react-dom'

// countdown = function(minutesElement, secondsElement){
//   cd = setInterval(function(){
//     if(secondsElement.innerHTML == "00"){
//       secondsElement.innerHTML = "60"
//       minutesElement.innerHTML = minutesElement.innerHTML - 1
//     }
//     secondsElement.innerHTML = paddingZeroes(secondsElement.innerHTML - 1, 2)
//   },1000)
//   if(secondsElement.innerHTML == "50"){
//     clearInterval(cd)
//   }
// }

paddingZeroes = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

export default class PageNotFound extends Component {

  componentDidMount(){
    min = document.getElementById('minutes')
    sec = document.getElementById('seconds')
    countdown(min, sec)
  }

  render(){
    return(
      <div className="timer">
        <span id="minutes">4</span>:
        <span id="seconds">04</span>
      </div>
    )
  }
}
