import { Mongo } from 'meteor/mongo';

export const LoggedUsers = new Mongo.Collection('loggedUsers');

if (Meteor.isServer) {
  Meteor.publish('loggedUsers', function loggedUsersPublication() {
    return LoggedUsers.find();
  });
}

Meteor.methods({
  'loggedUsers.fromSessionId': function(sessionId){
      currentUser = LoggedUsers.findOne({sessionId: sessionId})
      if(currentUser){
        return {logged: true, userId: currentUser._id, songlistId: currentUser.songlistId}
      }else{
        return {logged: false}
      }
  }
})

