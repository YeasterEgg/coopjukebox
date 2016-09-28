import { Mongo } from 'meteor/mongo';

export const Tokens = new Mongo.Collection('tokens');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('Tokens', function tokensPublication() {
    return Tokens.find();
  });
}
