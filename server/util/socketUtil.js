/*
Handles socket connections/disconnections/messages
Tracks connected users in memory
*/


//add our require paths to the require array
require.paths.unshift('util/');
require.paths.unshift('../shared/');
require.paths.unshift('modules/');

//assignments/loading
var 
    //module libraries
    log = require('logging')
    //cusom libraries
    , messageEventEmitter = require('messageEventEmitter')    
    //cusom module objects
    , modulesToLoad = require('_modulesToLoad')
  
//create the event emitter the modules use to handle
//messages from the client
var moduleEventEmit = new messageEventEmitter;

//attach the listeners for each of the modules
modulesToLoad.forEach(function(moduleName) {
  var modulePrototype = require(moduleName);
  var module = new modulePrototype;
  module.listen(moduleEventEmit);
})

//Object to store the users that are currently connected, indexed by sessionId
var connectedUsers = {};
//Array to store the active games
var games = []

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
 *                .type  the event to emit, that will be listened for by a module
 *                .args   the arguments to pass to the event listener
 *         socket         the socket object
*/
exports.message = function(obj) {
  //cache the event
  var type = obj.message.type;
  //remove the message object and replace with an args object, if one exists
  if (obj.message.args) {
    obj.args = obj.message.args;
  }
  delete obj.message;
  //add the connectedUsers
  obj.connectedUsers = connectedUsers;
  //add the games
  obj.games = games;
  //emit the event
  moduleEventEmit.emit(type, obj);
  return;
}

/*when the server gets a disconnect message from the user
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