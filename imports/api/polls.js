import { Mongo } from 'meteor/mongo';

export const Polls = new Mongo.Collection('polls');

if (Meteor.isServer) {
  Meteor.publish('polls.fromChosenName', function(chosenName) {
    return Polls.find({chosenName: chosenName, active: true})
  });
  Meteor.publish('polls.fromPlaylistId', function(playlistId) {
    return Polls.find({playlistId: playlistId, active: true})
  })
}
