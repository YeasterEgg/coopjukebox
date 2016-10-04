import { Mongo } from 'meteor/mongo';

export const Songlists = new Mongo.Collection('songlists');

if (Meteor.isServer) {
  Meteor.publish('songlistFromSonglistRndmId', function(songlistRndmId) {
    return Songlists.find({songlistRndmId: songlistRndmId})
  })
}

