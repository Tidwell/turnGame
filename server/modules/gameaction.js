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
    if (game) {
      game.placeLetter(obj);
    }
    else {
      throw new Error('placeLetter called without game');
    }
  }
}




module.exports = gameaction