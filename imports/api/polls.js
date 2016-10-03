import { Mongo } from 'meteor/mongo';

export const Polls = new Mongo.Collection('polls');

if (Meteor.isServer) {
  Meteor.publish('polls', function pollsPublication() {
    return Polls.find();
  });
  Meteor.publish('pollTrackList', function(pollId) {
    return Polls.find({pollId: pollId})
  });
}

