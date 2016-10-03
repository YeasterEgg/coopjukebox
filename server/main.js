import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'
import { Polls } from '../imports/api/polls.js'
const crypto = require('crypto')

Meteor.startup(() => {
})

getApiWrapper = Meteor.wrapAsync(getApi)
postApiWrapper = Meteor.wrapAsync(postApi)
updateTokenWrapper = Meteor.wrapAsync(updateToken)

Meteor.methods({

  // Goes to Spotify Auth Page and returns to the callback uri with 2 codes, used to get a valid Token
  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

  // Gets a user Token and creates the User, associated to Token, Playlist and SessionId
  "createUser": function(code, sessionId){

    // First part, gets the token
    tokenUrl = config.tokenUrl
    tokenHeaders = {'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'))}
    form = {
            code: code,
            redirect_uri: config.redirectUrl,
            grant_type: 'authorization_code'
          }
    getToken = postApiWrapper(tokenUrl, tokenHeaders, form)

    // Then it gets the User data with the newly obtained token
    userUrl = config.userUrl
    userHeaders = { 'Authorization': 'Bearer ' + getToken.body.access_token }
    getUserData = getApiWrapper(userUrl, userHeaders)

    // Finally stores everything in a new User, with a nested token object
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

  "createPlaylist": function(url, accessToken, object, userId){
    headers = {'Authorization': 'Bearer ' + accessToken },
    form = JSON.stringify(object),
    result = postApiWrapper(url, headers, form)
    pollId = crypto.randomBytes(8).toString('hex')
    LoggedUsers.update({_id: userId}, {$set: {playlistName: object.name, playlistSpotifyId: result.body.id, pollId: pollId }})

    // As of now, it just creates a Poll at the same time

    pollId = LoggedUsers.findOne({_id: userId}).pollId
    Polls.insert({
      playlist: object.name,
      pollId: pollId,
      userId: userId,
      possibleChoices: [],
      chosenTracks: [],
      maxChoices: 20,
      playlistLength: 10,
    })
  },

  "addTrackToPlaylist": function(pollId, trackUri){
    user = LoggedUsers.findOne({pollId: pollId})
    userId = user.spotifyId
    playlistId = user.playlistSpotifyId
    url = "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks"
    form = JSON.stringify({
      uris: [trackUri]
    })
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = postApiWrapper(url, headers, form)
    if(result.body.error && result.body.error.status == 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateToken(user._id)
      Meteor.call('addTrackToPlaylist', pollId, trackUri)
    }
  },

  "addTrackToPoll": function(pollId, track){
    poll = Polls.findOne({pollId: pollId})
    if(!poll) return null
    if(poll.maxChoices > poll.possibleChoices.length){
      newTrack = track
      newTrack['votes'] = 0
      Polls.update({pollId: pollId}, {$addToSet: {possibleChoices: newTrack}})
    }
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
