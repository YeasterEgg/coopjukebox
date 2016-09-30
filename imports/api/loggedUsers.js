import { Mongo } from 'meteor/mongo';

export const LoggedUsers = new Mongo.Collection('loggedUsers');

if (Meteor.isServer) {
  Meteor.publish('LoggedUsers', function loggedUsersPublication() {
    return LoggedUsers.find();
  });
}
