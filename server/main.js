import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'
import { Songlists } from '../imports/api/songlists.js'
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
      playlistLength: 0,
      playlistSpotifyId: "",
      songlistRndmId: "",
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

  "createPlaylist": function(options, userId){
    user = LoggedUsers.findOne({_id: userId})
    if(!user){return false}
    accessToken = user.token.accessToken
    userSpotifyId = user.spotifyId
    url = config.playlistUrl(userSpotifyId)
    headers = {'Authorization': 'Bearer ' + accessToken },
    form = JSON.stringify(_.pick(options, ['name', 'public']))
    result = postApiWrapper(url, headers, form)
    if(result.body.error && result.body.error.status === 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateToken(user._id)
      Meteor.call('createPlaylist', options, userId)
    }
    songlistRndmId = crypto.randomBytes(8).toString('hex')

    LoggedUsers.update({_id: userId}, {$set: {playlistName: options.name,
                                              playlistLength: options.length,
                                              playlistSpotifyId: result.body.id,
                                              songlistRndmId: songlistRndmId }})

    Songlists.insert({
      playlist: options.name,
      songlistRndmId: songlistRndmId,
      userId: userId,
      possibleChoices: {},
      playlistLength: options.length,
      poolSize: 10,
      startedAt: "",
      pollDuration: ""
    })
    return songlistRndmId
  },

  "addTrackToPlaylist": function(songlistRndmId, trackUri){
    user = LoggedUsers.findOne({songlistRndmId: songlistRndmId})
    userId = user.spotifyId
    playlistId = user.playlistSpotifyId
    url = "https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks"
    form = JSON.stringify({
      uris: [trackUri]
    })
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = postApiWrapper(url, headers, form)
    if(result.body.error && result.body.error.status === 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateToken(user._id)
      Meteor.call('addTrackToPlaylist', songlistRndmId, trackUri)
    }
  },

  "addTrackToSonglist": function(songlistId, track){
    songlist = Songlists.findOne({_id: songlistId})
    if(!songlist) return null
    track.votes = "0"
    Songlists.update({_id: songlistId}, {$set: {['possibleChoices.spo_'+track.spotifyId]: track}})
    return true
  },

  "addVoteToTrack": function(songlistId, track){
    songlist = Songlists.findOne({_id: songlistId})
    Songlists.update({_id: songlistId}, {$inc: {['possibleChoices.spo_'+track.spotifyId+'.votes']: 1}})
  },

  "userFromSonglistRndmId": function(songlistRndmId) {
    user = LoggedUsers.findOne({songlistRndmId: songlistRndmId})
    if(user){
      return {result: true, userId: user._id, playlistName: user.playlistName}
    }else{
      return {result: false}
    }
  },

  "startSonglistPoll": function(songlistId){
    songlist = Songlists.findOne({_id: songlistId})
    Songlists.update({_id: songlistId}, {$set: {startedAt: new Date}})
    return (new Date)
  }

})
