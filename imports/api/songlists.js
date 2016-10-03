import { Mongo } from 'meteor/mongo';

export const Songlists = new Mongo.Collection('songlists');

if (Meteor.isServer) {
  Meteor.publish('songlistFromSonglistId', function(songlistId) {
    return Songlists.find({songlistId: songlistId})
  })
}

