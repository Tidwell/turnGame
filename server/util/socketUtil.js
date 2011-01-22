/*
Handles socket connections/disconnections/messages
Tracks connected users in memory
*/


//assignments/loading
var 
    //module libraries
    log = require('logging');

//Object to store the users that are currently connected
//Indexed by sessionId
var connectedUsers = {};

/*when a user connects
 *@arg obj.
 *         client   client object
*/
exports.connect = function(obj) {
  var client = obj.client;
	//add to the connectedUsers object
  connectedUsers[client.sessionId] = {sessionId: client.sessionId};
  return;
}

/*when the server gets a message from the user
 *@arg obj.
 *         client   client object
           message  message sent from the client
*/
exports.message = function(obj) {
  var client = obj.client;
  var message = obj.message;
  return;
}

/*when the server gets a message from the user
 *@arg obj.
 *         client   client object
*/
exports.disconnect = function(obj) {
  var client = obj.client;
  //remove the player from the connectedUsers object
  delete connectedUsers[client.sessionId];
  return;
}