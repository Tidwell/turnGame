/*
Handles socket connections/disconnections/messages
Tracks connected users in memory
*/


//add our require paths to the require array
require.paths.unshift('util/');
require.paths.unshift('modules/');

//assignments/loading
var 
    //module libraries
    log = require('logging')
    //cusom libraries
    , messageEventEmitter = require('messageEventEmitter')    
    //cusom module objects
    , auth = require('auth')
  
//create the event emitter the modules use to handle
//messages from the client
var moduleEventEmit = new messageEventEmitter;

//attach the listeners for each of the modules
auth.listen(moduleEventEmit);

//Object to store the users that are currently connected, indexed by sessionId
var connectedUsers = {};

/*when a user connects
 *@arg obj.
 *         client   client object
 *         socket   the socket object
*/
exports.connect = function(obj) {
  var client = obj.client;
	//add to the connectedUsers object
  connectedUsers[client.sessionId] = {sessionId: client.sessionId};
  return;
}

/*when the server gets a message from the user
 *@arg obj.
 *         client         client object
 *         message        message object sent from the client
 *                .event  the event to emit, that will be listened for by a module
 *                .args   the arguments to pass to the event listener
 *         socket         the socket object
*/
exports.message = function(obj) {
  //cache the event
  var event = obj.message.event;
  //remove the message object and replace with an args object
  obj.args = obj.message.args;
  delete obj.message;
  //add the connectedUsers
  obj.connectedUsers = connectedUsers;
  //emit the event
  moduleEventEmit.emit(event, obj);
  return;
}

/*when the server gets a message from the user
 *@arg obj.
 *         client   client object
 *         socket   the socket object
*/
exports.disconnect = function(obj) {
  var client = obj.client;
  //remove the player from the connectedUsers object
  delete connectedUsers[client.sessionId];
  return;
}