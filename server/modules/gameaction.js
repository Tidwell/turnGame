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
    eventEmitter.on('userDisconnect', this.userDisconnect);
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
    var game = obj.connectedUsers.findGameFromClientSessionId(obj);
    game.placeLetter(obj);
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
  this.userDisconnect = function(obj) {
    var game = obj.connectedUsers.findGameFromClientSessionId(obj);
    if (game) {
      game.userDisconnect(obj);
    }
    else {
      //we won't find a game when a user is not in a game and disconnects - if this is single-world, or users auto-join
      //the game when authenticated, you should probably uncomment this as you always want to find the game on disconnect
      
      //throw new Error('Couldn\'t find game in userDisconnect handler in gameaction');
    }
  }
}




module.exports = gameaction