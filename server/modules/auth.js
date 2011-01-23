/*
Module for handling user authentication
.setName = sets a users name attribute in the connectedUsers
*/

//assignment/loading
var 
      log = require('logging');

//Module Declaration
function AuthenticationModule(eventEmitter) {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.listen = function(eventEmitter) {
    //declare the event listeners, first arg is the name of the 
    //event the client will send, second is the method to handle that event
    eventEmitter.on('setName', this.setName);
  }
  
  /*
  *Called when a user sends a setName command
  *sets a user's name attribute in their entry in the connectedUsers object
  *@arg obj.
  *         client         client object
  *         args           the arguments the user sent with the message
  *             .name      name the player is requesting
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  */
  this.setName = function(obj) {
    obj.connectedUsers[obj.client.sessionId].name = obj.args.name;
  }
}

//declare the module
module.exports = AuthenticationModule;
