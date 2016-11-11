uselessHash = {
  "poll.startPoll": function(playlist, pollSize, number){
    if(pollSize > 6 || pollSize < 2 || number > 12 || number < 2){
      Meteor.call("playlist.punishment", playlist)
      return {kind: "error", text: "Fuck you"}
    }
    availableChoices = cf.randomProperties(playlist.songlist,pollSize)
    Polls.insert({
      playlistId: playlist._id,
      songlist: playlist.songlist,
      availableChoices: availableChoices,
      votersChoices: {},
      pollSize: parseInt(pollSize),
      startedAt: new Date,
      active: true,
      winners: [],
      pollsLeft: parseInt(number),
      closesAt: new Date(new Date - - 300000),
      private: false
    }, function(err,res){
      if(!err){
        Meteor.setTimeout(function(){
          Meteor.call("poll.endPoll", res, playlist)
        }, 60000 * 5)
        return {kind: "success", text: res}
      }
    })
  },

  "poll.endPoll": function(pollId, playlist){
    closingPoll = Polls.findOne({_id: pollId})
    orderedTracks = _.sortBy(Object.values(closingPoll.availableChoices), function(track){
      return track.votes
    })
    winner = orderedTracks.slice(-1)[0]
    winnerUri = "spotify:track:" + winner.spotifyId
    Meteor.call('playlist.addTrackToPlaylist', playlist, winnerUri)
    if(closingPoll.pollsLeft > 0){
      delete closingPoll.songlist["track_" + winner.spotifyId]
      delete closingPoll.votersChoices["track_" + winner.spotifyId]
      nTracksFromVoters = Math.ceil(closingPoll.pollSize / 2)
      tracksFromVoters = cf.randomProperties(closingPoll.votersChoices, nTracksFromVoters)

      nTracksFromSonglist = closingPoll.pollSize - Object.keys(tracksFromVoters).length
      tracksFromSonglist = cf.randomProperties(closingPoll.songlist,nTracksFromSonglist)

      availableChoices = Object.assign(tracksFromVoters, tracksFromSonglist)

      // TODO: Add a check to add tracks if the merge has 2 or more identical tracks that will be used only once

      pollUpdates = {
        $push: {winners: winner},
        $set: {
              availableChoices: availableChoices,
              songlist: closingPoll.songlist,
              votersChoices: closingPoll.votersChoices,
              startedAt: new Date,
              closesAt: new Date(new Date - - winner.duration_ms),
              },
        $inc: {pollsLeft: -1}
      }
      Polls.update({_id: pollId}, pollUpdates)
      newPoll = Polls.findOne({_id: pollId})
      Meteor.setTimeout(function(){
        Meteor.call("poll.endPoll", newPoll._id, playlist)
      }, winner.duration_ms)
    }else{
      Polls.update({_id: pollId}, {$push: {winners: winner}, $set: {active: false}})
    }
  }
}
