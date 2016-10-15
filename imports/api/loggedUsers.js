import { Mongo } from 'meteor/mongo';

export const LoggedUsers = new Mongo.Collection('loggedUsers');

if (Meteor.isServer) {
  Meteor.publish('loggedUsers.fromSessionId', function loggedUsersFromId(sessionId) {
    return LoggedUsers.find({sessionId: sessionId});
  });
}
