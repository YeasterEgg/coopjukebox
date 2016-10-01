import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'

apiHelper = require('../imports/lib/apiHelper.js')
config = require('../imports/lib/config.js')
request = require('request')
querystring = require('querystring')

// Asynchronous Functions

getTokenValue = function(code, callback){
  authOptions = {
                  url: config.tokenUrl,
                  form: {
                    code: code,
                    redirect_uri: config.redirectUri,
                    grant_type: 'authorization_code'
                  },
                  headers: {
                    'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'))
                  },
                  json: true
                }
  request.post(authOptions, callback)
}

getApi = function(url, accessToken, callback){
  options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  request.get(options, callback)
}

postApi = function(url, accessToken, object, callback){
  options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + accessToken },
    form: JSON.stringify(object),
    json: true
  };
  request.post(options, callback)
}

getTokenFromUser = function(userId){
  user = LoggedUsers.findOne({_id: userId})
  if(user){
    accessToken = user.token.accessToken
    return accessToken
  }else{
    return false
  }
}

// Asynchronous functions wrappers

tokenValueWrapper = Meteor.wrapAsync(getTokenValue)

getApiWrapper = Meteor.wrapAsync(getApi)

postApiWrapper = Meteor.wrapAsync(postApi)


// Meteor Server

Meteor.startup(() => {
})


// Meteor Methods

Meteor.methods({

  // Goes to Spotify Auth Page and returns to the callback uri with 2 codes, used to get a valid Token

  "getAuthUrl": function(sessionId){
    return apiHelper.getAuth(config.clientId, config.redirectUri, config.scope, sessionId, config.authUrl)
  },

  // Gets a user Token and creates the User, associated to Token, Playlist and SessionId

  "createUser": function(code, sessionId){

    // First part, gets the token

    getToken = tokenValueWrapper(code)

    // Then it gets the User data with the newly obtained token

    getUserData = getApiWrapper("https://api.spotify.com/v1/me/", getToken.body.access_token)

    // Finally stores everything in a new User, with nested data about token and playlist

    LoggedUsers.insert({
      name: getUserData.body.display_name,
      email: getUserData.body.email,
      uri: getUserData.body.uri,
      spotifyId: getUserData.body.id,
      sessionId: sessionId,
      playlistName: "",
      playlistSpotifyId: "",
      pollId: "",
      token: {
        accessToken: getToken.body.access_token,
        tokenType: getToken.body.token_type,
        expiresIn: getToken.body.expires_in,
        refreshToken: getToken.body.refresh_token,
        scope: getToken.body.scope,
        validationStart: new Date,
      },
      createdAt: new Date,
    })
  },

  "refreshToken": function(url, accessToken, object){
    console.log(getTokenFromUser('XifPMvu6heJKxp6Rv'))
  },

  "createPlaylist": function(url, accessToken, object, userId){
    result = postApiWrapper(url, accessToken, object)
    pollId = crypto.randomBytes(8).toString('hex')
    LoggedUsers.update({_id: userId}, {$set: {playlistName: object.name, playlistSpotifyId: result.body.id, pollId: pollId }})
  },

  "addTrackToPlaylist": function(url, accessToken, object, userId){
    result = postApiWrapper(url, accessToken, object)
  },

  "userFromPollId": function(pollId) {
    user = LoggedUsers.findOne({pollId: pollId})
    if(user){
      return {result: true, userId: user._id, playlistName: user.playlistName}
    }else{
      return {result: false}
    }
  },

})
