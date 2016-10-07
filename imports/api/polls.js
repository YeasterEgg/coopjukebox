import { Mongo } from 'meteor/mongo';

export const Polls = new Mongo.Collection('polls');

if (Meteor.isServer) {
  Meteor.publish('pollFromSonglistRndmId', function(songlistRndmId) {
    return Polls.find({songlistRndmId: songlistRndmId, active: true})
  })
}

