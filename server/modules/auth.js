/*
Module for handling user authentication
.setName = sets a users name attribute in the connectedUsers
*/


//assignments/loading
var   log = require('logging')
    
//called when the module is loaded
exports.listen = function(eventEmitter) {
  //create a new instance of the module
  var auth = new AuthenticationModule(eventEmitter);
  //declare the event listeners
  eventEmitter.on('setName', auth.setName);
}

//Module Declaration
function AuthenticationModule(eventEmitter) {
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