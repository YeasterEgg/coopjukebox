import { Mongo } from 'meteor/mongo';

export const LoggedUsers = new Mongo.Collection('loggedUsers');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('LoggedUsers', function loggedUsersPublication() {
    return LoggedUsers.find();
  });
}
