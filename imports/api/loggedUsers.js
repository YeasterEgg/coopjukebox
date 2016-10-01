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
        return {logged: true, user: currentUser}
      }else{
        return {logged: false, user: false}
      }
    // tokenDuration = 3600 * 1000 // Spotify Token Duration in ms
    // lastToken = Tokens.find({}, {sort: {createdAt: -1}}).fetch()[0]
    // if(lastToken){
    //   expiringDate = new Date(lastToken.createdAt.getTime() + tokenDuration)
    //   now = new Date
    //   if(expiringDate > now){
    //     return {valid: true, token: lastToken}
    //   }else{
    //     return {valid: false, token: lastToken}
    //   }
    // }else{
    //   return {valid: false, token: false}
    // }
  }
})

