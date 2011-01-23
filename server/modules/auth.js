/*
Module for handling user authentication
.setName = sets a users name attribute in the connectedUsers
*/

//add our require paths to the require array
require.paths.unshift('shared/');

//assignment/loading
var 
      isValidName = require('isValidName').isValidName,
      log = require('logging');

//Module Declaration
function auth(eventEmitter) {
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
    if(isValidName.check(obj.args.name)) {
      obj.connectedUsers[obj.client.sessionId].name = obj.args.name;
      obj.client.send({type: 'nameSet', args: {name: obj.args.name}});
      log(obj.connectedUsers);
    }
  }
}

//declare the module
module.exports = auth;
