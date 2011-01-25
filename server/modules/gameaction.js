/*
Module for a gamestate commands
*/


var 
      log = require('logging');

function gameaction() {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.listen = function(eventEmitter) {
    eventEmitter.on('placeLetter', this.placeLetter);
  }
  
  
  
/*
  *Called when a user sends a placeLetter command
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         args           the arguments the user sent with the message
  *             .x          {x,y} position they want to place at
  *             .y
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.placeLetter = function(obj) {
    //get the specific game object this is intended for
    var targetGame;
    var i = 0;
    obj.games.forEach(function(game) {
      game.players.forEach(function(player) {
        if (player == obj.client.sessionId) {
          targetGame = i;
        }
      });
      i++;
    });
    obj.games[targetGame].placeLetter(obj);
  }
}

module.exports = gameaction