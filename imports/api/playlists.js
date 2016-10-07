import { Mongo } from 'meteor/mongo';

export const Playlists = new Mongo.Collection('playlists');

if (Meteor.isServer) {
  Meteor.publish('playlists.fromUserId', function(userId) {
    return Playlists.find({userId: userId})
  }),

  Meteor.publish('playlists.fromSpotifyId', function(spotifyId) {
    return Playlists.find({_id: spotifyId})
  })
}

Meteor.methods({

  "playlists.create": function(playlist, userId){
    Playlists.insert({
      _id: playlist.spotifyId,
      playlist: playlist.name,
      userId: userId,
      songlist: {},
      playlistLength: playlist.length,
      pollSize: 4,
      pollDuration: playlist.duration,

      startedAt: new Date,
    })
  },

})
