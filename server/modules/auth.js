/*
Module for handling user authentication
.setName = sets a users name attribute in the connectedUsers
*/


//Module Declaration
function AuthenticationModule(eventEmitter) {
  /*
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.listen = function(eventEmitter) {
    //declare the event listeners
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
