import { Meteor } from 'meteor/meteor'
import { Polls } from '../../imports/api/polls.js'
import { Playlists } from '../../imports/api/playlists.js'
import { LoggedUsers } from '../../imports/api/loggedUsers.js'

Meteor.methods({

  "poll.startPoll": function(playlist){
    if(Polls.findOne({playlistId: playlist._id, active: true})){
      return false
    }else{
      Polls.insert({
        playlistId: playlist._id,
        active: true,
        availableChoices: playlist.songlist,
        votersChoices: {},
        startedAt: new Date,
        winners: [],
      }, function(err,res){
        if(res){
          Meteor.call('poll.startLifecycle', res)
        }
      })
    }
  },

  "poll.startLifecycle": function(pollId){

    // The poll starts! It starts the winning song lifecycle, which every n minutes selects the most
    // voted song to add to the playlist, then removes it from the songlist.

    poll = Polls.findOne({_id: pollId})
    pollReloadTimeout = poll.reloadTimeout
    firstSongTimeout = 30000

    Meteor.setTimeout(function(){
      Meteor.call("poll.winnerPrize", pollId)
    }, firstSongTimeout)
  },

  "poll.winnerPrize": function(pollId){

    // Finds the Poll and orders for votes
    // Then the winner is added to the playlist and removed from the current songlist.

    poll   = Polls.findOne({_id: pollId})
    if(poll.active === false){
      console.log('The poll has been stopped, silly you!')
      return false
    }
    orderedTracks = _.sortBy(Object.values(poll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('playlist.addTrackToPlaylist', poll.playlistId, winnerUri)

    delete poll.availableChoices["track_" + winner.spotifyId]

    pollUpdates = {
      $push: { winners: winner},
      $set:  { availableChoices: poll.availableChoices }
    }
    Polls.update({_id: pollId}, pollUpdates)

    Meteor.setTimeout(function(){
      Meteor.call("poll.winnerPrize", pollId)
    }, (winner.duration_ms + 10000))
  },

  "poll.stopPoll": function(pollId){
    Polls.update({_id: pollId}, {$set: {active: false}})
  },
})
