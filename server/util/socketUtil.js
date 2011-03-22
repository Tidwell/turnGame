/*
Handles socket connections/disconnections/messages
Tracks connected users in memory
*/


//add our require paths to the require array
//require.paths.unshift('util/');
//require.paths.unshift('../shared/');
//require.paths.unshift('./modules/');

//assignments/loading
var 
    //module libraries
    log = require('logging')
    //cusom libraries
    , messageEventEmitter = require('./messageEventEmitter')    
    //cusom module objects
    , modulesToLoad = require(process.cwd()+'/client/shared/modulesToLoad')
  
//create the event emitter the modules use to handle
//messages from the client
var moduleEventEmit = new messageEventEmitter;

//attach the listeners for each of the modules
modulesToLoad.forEach(function(moduleName) {
  var modulePrototype = require('./../modules/'+moduleName);
  var module = new modulePrototype;
  module.listen(moduleEventEmit);
})

//Object to store the users that are currently connected, indexed by sessionId
var connectedUsers = {};


/*
  *Needs to be extracted, takes the obj, and based on either obj.client.sessionId or the passed in idOverride, will find
  *the game with the corresponding user's sessionId as a player.  If none is found, returns false
  *Also sets a property gameIndex on the corresponding game.  Note that you should ONLY rely on the validity of gameIndex on the game
  *if you explicitly call this function before using the property (otherwise it could be wrong, need to fix this)
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
connectedUsers.findGameFromClientSessionId = function(obj, idOverride) {
  if (!obj.games) {
    throw new Error('No games array present in object');
  }
  //get the specific game object this is intended for
  if (typeof idOverride != 'undefined') {
    var id = idOverride;
  } else {
    var id = obj.client.sessionId
  }
  var targetGame = null;
  var i = 0;
  obj.games.forEach(function(game) {
    game.players.forEach(function(player) {
      if (player.sessionId == id) {
        targetGame = i;
      }
    });
    i++;
  });
  if (targetGame != null) {
    obj.games[targetGame].gameIndex = targetGame;
    return obj.games[targetGame];
  }
  return false;
}


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
  if (type == undefined) {
    //throw new Error('no type specified in command');
    return false;
  }
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
  obj.games = games;
  obj.connectedUsers = connectedUsers;
  //notify all of the games about the disconnect
  gameUserDisconnect(obj);
  //notify all the other modules that a user Disconnected
  moduleEventEmit.emit('userDisconnect', obj);
  //remove the player from the connectedUsers object
  delete connectedUsers[client.sessionId];
  return;
}

/*
  *Called when a user disconnects
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
*/
var gameUserDisconnect = function(obj) {
  var game = obj.connectedUsers.findGameFromClientSessionId(obj);
  if (game) {
    log('game found, disconnecting users from');
    log(game);
    game.userDisconnect(obj);
  }
  else {
    //we won't find a game when a user is not in a game and disconnects - if this is single-world, or users auto-join
    //the game when authenticated, you should probably uncomment this as you always want to find the game on disconnect
    
    //throw new Error('Couldn\'t find game in userDisconnect handler in gameaction');
  }
}