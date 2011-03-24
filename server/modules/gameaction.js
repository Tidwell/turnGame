/*
Module for a gamestate commands
*/
function gameaction(obj) {
  var gameaction = this;
  
  obj.client.on('placeLetter', function(obj) {
    gameaction.placeLetter(obj)
  });
  
 /*
  *Called when a user sends a placeLetter command
  *
  *@arg obj.
  *         client         the client object that sent the command
  *         socket         the socket object
  *         args           the arguments the user sent with the message
  *             .x          {x,y} position they want to place at
  *             .y
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  *         game           the game that the player is in that sent the command
  */
  this.placeLetter = function(obj) {
    if (obj.game) {
      obj.game.placeLetter(obj);
    }
    else {
      //add a debug check to all these throws
      throw new Error('placeLetter called without game');
    }
  }
}

module.exports = gameaction