/*
Module for a gamestate
*/


var 
      log = require('logging');

function gamestate() {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.listen = function(eventEmitter) {
    //eventEmitter.on('', );
  }
  
  this.players = [];
  
  /*
  *Adds a player to the game.  If the game is full, begins the game
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  */
  this.addPlayer = function(obj) {
    //add the player to the game
    this.players.push(obj.client.sessionId);
    //if the game has 2 players in it
    if (this.players.length == 2) {
      //tell the players the game begins
      obj.socket.clients[this.players[0]].send({type: 'gameStart', args: {players: this.players}});
      obj.socket.clients[this.players[1]].send({type: 'gameStart', args: {players: this.players}});
    }
  }
  
  //returns the players in the game 
  this.getPlayers = function() {
    return this.players;
  }
}

module.exports = gamestate
