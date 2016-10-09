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
