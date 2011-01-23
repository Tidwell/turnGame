/*
Module for handling matchmaking
*/

//add our require paths to the require array

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
  this.listen = function(eventEmitter) {
    eventEmitter.on('joinGame', this.joinGame);
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
    if (obj.connectedUsers[obj.client.sessionId].inGame) {
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
      if (game.getPlayers().length == 1) {
        emptyGame = i;
      }
      i++;
    });
    if (emptyGame != null) {
      //if we found a game
      obj.games[emptyGame].addPlayer({socket: obj.socket, client: obj.client});
      //log(obj.games);
      return true;
    }
    //otherwise create a new gamestate
    var g = new gamestate();
    g.addPlayer({socket: obj.socket, client: obj.client});
    obj.games.push(g);
  }
}

//declare the module
module.exports = matchmaker;
