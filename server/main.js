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

  "getAuthUrl": function(sessionId){
    return getAuth(config.clientId, config.redirectUrl, config.scope, sessionId, config.authUrl)
  },

  "createUser": function(code, sessionId){
    tokenUrl = config.tokenUrl
    tokenHeaders = {'Authorization': 'Basic ' + (new Buffer(config.clientId + ':' + config.clientSecret).toString('base64'))}
    form = {
            code: code,
            redirect_uri: config.redirectUrl,
            grant_type: 'authorization_code'
          }
    getToken = postApiWrapper(tokenUrl, tokenHeaders, form)

    userUrl = config.userUrl
    userHeaders = { 'Authorization': 'Bearer ' + getToken.body.access_token }
    getUserData = getApiWrapper(userUrl, userHeaders)
    console.log(getUserData.body)

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
    return getUserData.body
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
    songlistRndmId = crypto.randomBytes(12).toString('hex')

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
      pollSize: 4,
      startedAt: "",
      pollDuration: options.duration,
      userSpotifyId: userSpotifyId,
      playlistSpotifyId: result.body.id
    }, function(err, result){
      return result
    })
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
      updateTokenWrapper(user._id)
      Meteor.call('addTrackToPlaylist', songlistRndmId, trackUri)
    }
  },

  "addTrackToSonglist": function(songlistRndmId, track){
    songlist = Songlists.findOne({songlistRndmId: songlistRndmId})
    if(!songlist) return null
    Songlists.update({_id: songlistRndmId}, {$set: {['possibleChoices.spo_'+track.spotifyId]: track}})
    return true
  },

  "addVoteToTrack": function(songlistRndmId, track){
    songlist = Polls.findOne({songlistRndmId: songlistRndmId, active: true})
    increment = {['availableChoices.spo_'+track.spotifyId+'.votes']: 1}
    Polls.update({songlistRndmId: songlistRndmId, active: true}, {$inc: increment})
  },

  "userFromSonglistRndmId": function(songlistRndmId) {
    user = LoggedUsers.findOne({songlistRndmId: songlistRndmId})
    if(user){
      return {result: true, userId: user._id, playlistName: user.playlistName}
    }else{
      return {result: false}
    }
  },

  "startSonglistPoll": function(songlistRndmId, pollNumber){
    songlist = Songlists.findOne({songlistRndmId: songlistRndmId})
    nRandomSongs = _.sample(songlist.possibleChoices, songlist.pollSize)
    availableChoices = {}
    _.map(nRandomSongs, function(song){
      availableChoices['spo_'+song.spotifyId] = song
    })
    Polls.insert({
      songlistRndmId: songlistRndmId,
      possibleChoices: songlist.possibleChoices,
      availableChoices: availableChoices,
      pollSize: songlist.pollSize,
      startedAt: new Date,
      pollDuration: songlist.pollDuration,
      active: true,
      winners: [],
      pollsLeft: parseInt(songlist.playlistLength)
    }, function(err,result){
      if(!err){
        Meteor.setTimeout(function(){
          Meteor.call("endPoll", songlistRndmId)
        }, 60000 * songlist.pollDuration)
        return result
      }
    })
  },

  "endPoll": function(songlistRndmId){
    poll = Polls.findOne({songlistRndmId: songlistRndmId, active: true})
    if(!poll) return false
    orderedTracks = _.sortBy(Object.values(poll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('addTrackToPlaylist', songlistRndmId, winnerUri, function(err, res){
    })
    if(poll.pollsLeft > 0){
      console.log("new poll!")
      nRandomSongs = _.sample(poll.possibleChoices, poll.pollSize)
      availableChoices = {}
      _.map(nRandomSongs, function(song){
        availableChoices['spo_'+song.spotifyId] = song
      })
      Polls.update({songlistRndmId: songlistRndmId, active: true}, {$push: {winners: winner},
                                                                    $set: {availableChoices: availableChoices},
                                                                    $inc: {pollsLeft: -1}})
      Meteor.setTimeout(function(){
        Meteor.call("endPoll", songlistRndmId)
      }, 60000 * poll.pollDuration)
    }else{
      console.log('no more polls :(')
      Polls.update({songlistRndmId: songlistRndmId, active: true}, {$push: {winners: winner},
                                                                    $set: {active: false}})
    }
  },

  "importPlaylist": function(playlistSpotifyId, songlistRndmId){
    user = LoggedUsers.findOne({songlistRndmId: songlistRndmId})
    if(!user) return false
    url = config.playlistTracksUrl(user.spotifyId, playlistSpotifyId)
    headers = {'Authorization': 'Bearer ' + user.token.accessToken }
    result = getApiWrapper(url, headers)
    if(result.body.error && result.body.error.status === 401){
      // {error: { status: 401, message: 'The access token expired' }}
      updateTokenWrapper(user._id)
      Meteor.call('importPlaylist', playlistSpotifyId, songlistRndmId)
    }else if(result.body.error){
      return result.body.error
    }else{
      possibleChoices = {}
      _.map(result.body.items, function(item){
        parsedTrack = cf.getTrackValues(item.track)
        parsedTrack.votes = 0
        possibleChoices["possibleChoices.spo_" + item.track.id] = parsedTrack
      })
      Songlists.update({songlistRndmId: songlistRndmId}, {$set: possibleChoices})
      return result.body
    }
  },

})
