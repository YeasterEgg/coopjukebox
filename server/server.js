import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'

apiHelper = require('../imports/lib/apiHelper.js')
request = require('request')
querystring = require('querystring')

// Functions
getTokenValue = function(code, callback){
  authOptions = {
                  url: tokenUrl,
                  form: {
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                  },
                  headers: {
                    'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
                  },
                  json: true
                }
  request.post(authOptions, callback)
}

getInfo = function(url, accessToken, callback){
  options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  request.get(options, callback)
}

postInfo = function(url, accessToken, object, callback){
  options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    form: JSON.stringify(object),
    json: true
  };
  request.post(options, callback)
}

// Wrapper variables

tokenValue = Meteor.wrapAsync(getTokenValue)

infoValue = Meteor.wrapAsync(getInfo)

postValue = Meteor.wrapAsync(postInfo)

// Meteor forrealsies

Meteor.startup(() => {
})

Meteor.methods({
  "getAuth": function(sessionId){
    return apiHelper.getAuth(clientId, redirectUri, scope, sessionId, authUrl)
  },

  "getToken": function(code){
    body = tokenValue(code).body
    newCall = infoValue("https://api.spotify.com/v1/me/", body.access_token)

    Tokens.insert({
      accessToken: body.access_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in,
      refreshToken: body.refresh_token,
      scope: body.scope,
      userId: newCall.body.id,
      createdAt: new Date
    })

    if(LoggedUsers.find({userId: newCall.body.id}).fetch().length == 0){
      console.log("Welcome "+newCall.body.display_name)
      LoggedUsers.insert({
        name: newCall.body.display_name,
        email: newCall.body.email,
        uri: newCall.body.uri,
        userId: newCall.body.id,
        playlistName: false,
        playlistId: false,
        createdAt: new Date
      })
    }else{
      console.log("User already Registered!")
    }
  },

  "refreshToken": function(url, accessToken, object){
    // result = postValue(url, accessToken, object)
    // console.log(result.body)
  },

  "createPlaylist": function(url, accessToken, object, userId){
    result = postValue(url, accessToken, object)
    LoggedUsers.update({userId: userId}, {$set: {playlistName: object.name, playlistId: result.body.id}})
  }

})
