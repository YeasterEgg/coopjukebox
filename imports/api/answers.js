import { Mongo } from 'meteor/mongo';

export const Answers = new Mongo.Collection('answers');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('answers', function answersPublication() {
    return Answers.find();
  });
}
