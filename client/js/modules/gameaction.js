/*
Module for gamestate events, (aka gameaction)
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

function gameaction(socket) {
  //to avoid this confusion
  var game = this;
  this.mysocket = socket;
  
  this.gameShow = function() {
    $('#gamestate').fadeIn();
  }
  
  /*
  *Called when a new game has begun
  *@arg     args           the arguments the server sent with the message
  *             .players   the players in the game
  */
  this.gameStart = function(args) {
    //remove any existing player information and reset the board
    $('#gamestate td').html(' ');
    $('#gamestate ul li').remove();
    //add the new player info
    args.players.forEach(function(player) {
      $('#gamestate ul.players').append('<li rel="'+player+'">'+player+'</li>');
    });
  }

  /*
  *Called when the server tells the players names
  *@arg     args           the arguments the server sent with the message
  *             .players   names of players in the game
  */
  
  this.playerNames = function(args) {
    var i = 0;
    $('#gamestate ul.players li').each(function() {
      $(this).html(args.players[i]);
      i++;
    });
  }
  
  /*
  *Called when the active player changes
  *@arg     args           the arguments the server sent with the message
  *             .player    the players in the game
  */
  this.activePlayer = function(args) {
    $('#gamestate ul.players li').removeClass('active');
    $('#gamestate ul.players li[rel='+args.player+']').addClass('active');
  }
  
  this.boardUpdate = function(args) {
    $('#gamestate td[rel=x'+args.change.x+'y'+args.change.y+']').html(args.value);
  }
  
  this.gameOver = function(args) {
    //console.log(args.winner.winner, this.mysocket.transport.sessionid);
    if (Number(this.mysocket.transport.sessionid) == args.winner) {
      modules.matchmaker.endGame('win');
    }
    else {
      modules.matchmaker.endGame('lost');
    }
  }
  
  $('#gamestate td').click(function() {
    var loc = {
      x: $(this).attr('rel')[1],
      y: $(this).attr('rel')[3]
    };
    socket.send({type: 'placeLetter', args: {x: loc.x, y: loc.y}});
  });
  
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
modules.gameaction = new gameaction;
