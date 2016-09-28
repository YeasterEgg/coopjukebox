import { Meteor } from 'meteor/meteor'
import { Answers } from '../imports/api/answers.js'
querystring = require('querystring')
request = require('request')
apiHelper = require('../imports/lib/apiHelper.js')

Meteor.startup(() => {
})

Meteor.methods({

  "getAuth": function(sessionId){
    return apiHelper.getAuth(sessionId)
  }
  // "ajaxCall": function(){
  //   Meteor.http.get(authUrl, {params: params}, function(err, result) {
  //   });
})
