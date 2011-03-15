/*
Module for handling matchmaking
*/

//add our require paths to the require array
require.paths.unshift('game/');

//assignment/loading
var 
      log = require('logging');
      gamestate = require('gamestate');

//Module Declaration
function matchmaker() {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.eventEmitter = {};
  var matchmaker = this;
  
  this.listen = function(eventEmitter) {
    eventEmitter.on('joinGame', this.joinGame);
    eventEmitter.on('gameEnd', this.gameEnd);
    this.eventEmitter = eventEmitter;
  }
  
  
  /*
  *Called when a game broadcasts that it has ended.  Finds the corresponding game, unsets their inGame property and
  *removes the game from the games array
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.gameEnd = function(obj) {
    //if there was no winner, than we have an empty game due to disconnect, and we need to run a cleanup to remove em
    if (obj.winner) {
      var i = 0;
      var game = obj.connectedUsers.findGameFromClientSessionId(obj, obj.winner.sessionId);
      if (!game) {
        throw new Error('Could not find game in matchmaker.gameEnd');
      }
      game.players.forEach(function(player) {
        if (obj.connectedUsers[player.sessionId]) {
          obj.connectedUsers[player.sessionId].inGame = false;
        }
      });
      obj.games.remove(game.gameIndex)
    }
    else {
      var i = 0;
      var toDelete;
      obj.games.forEach(function(game) {
        log(game);
        if (game.players.length == 0) {
          toDelete = i;    
        }
        i++;
      })
      obj.games.remove(toDelete)
    }
  }
  
 /*
  *Called when a user sends a joinGame command
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.joinGame = function(obj) {
    //check they aren't in a game
    if (obj.connectedUsers[obj.client.sessionId].inGame == true) {
      obj.client.send({type: 'inGameError'});
      return false;
    }
    //otherwise
    //set their in-game flag
    obj.connectedUsers[obj.client.sessionId].inGame = true;
    
    var emptyGame = null;
    var i = 0;
    //find the first empty game
    obj.games.forEach(function(game) {
      if (game.getPlayers().length != game.maxPlayers) {
        emptyGame = i;
      }
      i++;
    });
    if (emptyGame != null) {
      //if we found a game
      obj.games[emptyGame].addPlayer({socket: obj.socket, client: obj.client, connectedUsers: obj.connectedUsers});
      return true;
    }
    //otherwise create a new gamestate
    var g = new gamestate(matchmaker.eventEmitter);
    g.addPlayer({socket: obj.socket, client: obj.client, connectedUsers: obj.connectedUsers});
    obj.games.push(g);
  }
  
  
  
}

//declare the module
module.exports = matchmaker;


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};