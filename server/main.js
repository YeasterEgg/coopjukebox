import { Meteor } from 'meteor/meteor'
import { Tokens } from '../imports/api/tokens.js'
apiHelper = require('../imports/lib/apiHelper.js')
request = require('request')

Meteor.startup(() => {
})

Meteor.methods({
  "getAuth": function(sessionId){
    return apiHelper.getAuth(sessionId)
  },

  "getToken": function(code){
    apiHelper.getToken(code,"https://api.spotify.com/v1/me/playlists", function(res){
      console.log(res)
    })
  },

  "createToken": function(body, access_token, token_type, expires_in, refresh_token){
    Tokens.insert({
      token: access_token,
      type: token_type,
      duration: expires_in,
      refreshToken: refresh_token,
      createdAt: new Date
    })
  },

})
