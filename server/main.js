import { Meteor } from 'meteor/meteor'
import { Tokens } from '../imports/api/tokens.js'
import { LoggedUsers } from '../imports/api/loggedUsers.js'
import '../imports/api/tokens.js'

apiHelper = require('../imports/lib/apiHelper.js')
request = require('request')
querystring = require('querystring')

const clientId = "7c5e5454fa984628b185a254e6de4331"
const clientSecret = "60931e45084d44349b6b6f63c8aa5760"
const redirectUri = "http://localhost:3000/"
const scope = "user-read-private user-read-email playlist-modify playlist-modify-private"
const authUrl = "https://accounts.spotify.com/authorize"
const tokenUrl = "https://accounts.spotify.com/api/token"

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
        createdAt: new Date
      })
    }else{
      console.log("User already Registered!")
    }
  },

  "postData": function(url, accessToken, object){
    result = postValue(url, accessToken, object)
    console.log(result.body)
  }

})
