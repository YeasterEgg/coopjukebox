import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tokens = new Mongo.Collection('tokens');

if (Meteor.isServer) {
  Meteor.publish('tokens', function tokensPublication() {
    return Tokens.find();
  });
}

Meteor.methods({
  'tokens.lastValid': function(){
    tokenDuration = 3600 * 1000 // Spotify Token Duration in ms
    lastToken = Tokens.find({}, {sort: {createdAt: -1}}).fetch()[0]
    if(lastToken){
      expiringDate = new Date(lastToken.createdAt.getTime() + tokenDuration)
      now = new Date
      if(expiringDate > now){
        return {valid: true, token: lastToken}
      }else{
        return {valid: false, token: lastToken}
      }
    }else{
      return {valid: false, token: false}
    }
  }
})
