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
  this.eventEmitter = {};
  var matchmaker = this;
  
  this.listen = function(eventEmitter) {
    eventEmitter.on('joinGame', this.joinGame);
    eventEmitter.on('gameEnd', this.gameEnd);
    this.eventEmitter = eventEmitter;
  }
  
  this.gameEnd = function(obj) {
    var winner = obj.winner, 
        games = obj.games
        
    var i = 0;
    var toRemove = undefined;
    games.forEach(function(game) {
      if (game.players[0] == winner || game.players[1] == winner) {
        toRemove = i;
        obj.connectedUsers[game.players[0]].inGame = false;
        obj.connectedUsers[game.players[1]].inGame = false;
      }
    });
    if (typeof toRemove != 'undefined') {
      games.remove(toRemove);
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
      if (game.getPlayers().length == 1) {
        emptyGame = i;
      }
      i++;
    });
    if (emptyGame != null) {
      //if we found a game
      obj.games[emptyGame].addPlayer({socket: obj.socket, client: obj.client, connectedUsers: obj.connectedUsers});
      //log(obj.games);
      return true;
    }
    //otherwise create a new gamestate
    var g = new gamestate(matchmaker.eventEmitter);
    g.addPlayer({socket: obj.socket, client: obj.client});
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