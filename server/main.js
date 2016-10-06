import { Meteor } from 'meteor/meteor'
import { LoggedUsers } from '../imports/api/loggedUsers.js'
import { Songlists } from '../imports/api/songlists.js'
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
    console.log(getUserData.body)

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
      poolSize: 5,
      startedAt: "",
      pollDuration: ""
    })
    return Songlists.findOne({songlistRndmId: songlistRndmId})
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
    Songlists.update({_id: songlistId}, {$set: {['possibleChoices.spo_'+track.spotifyId]: track}})
    return true
  },

  "addVoteToTrack": function(songlistRndmId, track){
    songlist = Polls.findOne({songlistRndmId: songlistRndmId})
    increment = {['possibleChoices.spo_'+track.spotifyId+'.votes']: 1}
    Polls.update({songlistRndmId: songlistRndmId}, {$inc: increment})
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
    nRandomSongs = _.sample(songlist.possibleChoices, songlist.poolSize)
    possibleChoices = {}
    _.map(nRandomSongs, function(song){
      song.votes = 0;
      possibleChoices['spo_'+song.spotifyId] = song
    })
    Polls.insert({
      songlistRndmId: songlist.songlistRndmId,
      possibleChoices: possibleChoices,
      startedAt: new Date,
      ended: false,
      winner: "",
      pollsLeft: songlist.playlistLength
    })
    Meteor.setTimeout(function(){Meteor.call("endPoll", songlist.songlistRndmId)}, 60000 * songlist.pollDuration)
    return (possibleChoices)
  },

  "endPoll": function(songlistRndmId){
    poll = Polls.findOne({songlistRndmId: songlistRndmId})
    if(!poll) return false
    tracks = Object.values(poll.possibleChoices)
    orderedTracks = _.sortBy(tracks, function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('addTrackToPlaylist', songlistRndmId, winnerUri)
    Polls.update({songlistRndmId: songlistRndmId}, {ended: true, winner: winner})
    if(poll.pollsLeft > 0){
      songlist = Songlists.findOne({songlistRndmId: songlistRndmId})
      nRandomSongs = _.sample(songlist.possibleChoices, songlist.poolSize)
      possibleChoices = {}
      _.map(nRandomSongs, function(song){
        song.votes = 0;
        possibleChoices['spo_'+song.spotifyId] = song
      })
      Polls.insert({
        songlistRndmId: poll.songlistRndmId,
        possibleChoices: poll.possibleChoices,
        startedAt: new Date,
        ended: false,
        winner: "",
        pollsLeft: poll.pollsLeft - 1
      })
      Meteor.setTimeout(function(){Meteor.call("endPoll", songlist.songlistRndmId)}, 60000 * songlist.pollDuration)
    }
  },

  // "updateSonglistPoll": function(songlistId){
  //   songlist = Songlists.findOne({_id: songlistId})
  //   if(!songlist.startedAt){
  //     nRandomSongs = _.sample(songlist.possibleChoices, songlist.poolSize)
  //     possibleChoices = _.map(nRandomSongs, function(song){
  //       song.votes = 0
  //     })
  //     Polls.update({
  //       songlistRndmId: songlistRndmId,
  //       possibleChoices: possibleChoices,
  //       startedAt: new Date,
  //       pollDuration: songlist.pollDuration
  //     })
  //     return (new Date)
  //   }else{
  //     return false
  //   }
  // },

  "importPlaylist": function(playlistSpotifyId, songlistRndmId){
    user = LoggedUsers.findOne({songlistRndmId: songlistRndmId})
    if(!user) return false
    url = config.playlistTracksUrl(user.spotifyId, playlistSpotifyId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(result.body.error && result.body.error.status === 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateToken(user._id)
      Meteor.call('importPlaylist', playlistSpotifyId, songlistRndmId)
    }else if(result.body.error){
      console.log(result.body.error)
      return result.body.error
    }else{
      possibleChoices = {}
      _.map(result.body.items, function(item){
        parsedTrack = cf.getTrackValues(item.track)
        parsedTrack.votes = 0
        possibleChoices["possibleChoices.spo_" + item.track.id] = parsedTrack
      })

      console.log(possibleChoices)
      Songlists.update({songlistRndmId: songlistRndmId}, {$set: possibleChoices})
      return possibleChoices
    }
  },

})
