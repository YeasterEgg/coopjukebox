import { Mongo } from 'meteor/mongo';

export const Playlists = new Mongo.Collection('playlists');

if (Meteor.isServer) {
  Meteor.publish('playlists.fromUserId', function(userId) {
    return Playlists.find({userId: userId})
  })
}
