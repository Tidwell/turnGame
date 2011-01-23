/*
Module for gamestate hadling
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

function gamestate(socket) {
  //to avoid this confusion
  var auth = this;
  
  this.gameShow = function() {
    $('#gamestate').fadeIn();
  }
  
  /*
  *Called when a new game has begun
  *@arg     args           the arguments the server sent with the message
  *             .players   the players in the game
  */
  this.gameStart = function(args) {
    //remove any existing player information
    $('#gamestate ul li').remove();
    //add the new player info
    args.players.forEach(function(player) {
      $('#gamestate ul.players').append('<li>'+player+'</li>');
    });
  }
  
}