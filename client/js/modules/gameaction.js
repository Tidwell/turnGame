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
    $('#gamestate ul.players li').remove();
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
  
  this.gameOver = function(args) {
    //console.log(args.winner.winner, this.mysocket.transport.sessionid);
    if (Number(this.mysocket.transport.sessionid) == args.winner) {
      modules.matchmaker.endGame('win');
    }
    else {
      modules.matchmaker.endGame('lost');
    }
  }
  
  /*
  args.map {
    hexes: [
      {
        x: #
        y: #
        z: #
      },
    ]
  }
  */
  this.renderMap = function(args) {
    args.map.hexes.forEach(function(hex) {
      //create it
      var domHex = createHex(hex);
      if (args.map.startRed.x == hex.x && args.map.startRed.y == hex.y) {
        domHex.addClass('startRed');
      }
      //for some reason we will setTimeout this.  It will need to be
      //use the animation queue eventually...
      setTimeout(function() {
        //animate the hex up 18 px for each level
        if (hex.z > 0) {
          var amnt = 18*(hex.z);
          $(domHex).animate({
             top: '-='+amnt
          },1000);
        }
      }, 3000);

    });
    finish();
  }
  var createHex = function(obj) {
    var q = obj.x;
    var i = obj.y;
    var hex = $('<div class="hex"></div>').appendTo('#map #hexContainer');
    hex.css('top', 0-(34*i)+(11*q)); //29, 7
    hex.css('left', 0+(94*q)+(72*i)); //58, 42
    hex.css('z-index', 10-i);
    hex.data('column', q);
    hex.data('row', i);
    hex.attr('rel', 'x'+q+'y'+i);
    hex.text('x'+q+'y'+i);
    return hex;
  }
  
  
  
  function finish() {
  var i = 0;
  var randHex = function() {
    var hex = Math.floor(Math.random()*50);
    return hex;
  }

  
  $($('.hex')[randHex()]).append('<div class="char spy"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char engineer"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char heavy"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char soldier"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char medic"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char pyro"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char demo"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char scout"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char sniper"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char sentry"><div class="img"></div></div>');
  
   $($('.hex')[randHex()]).append('<div class="char spy"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char engineer"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char heavy"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char soldier"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char medic"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char pyro"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char demo"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char scout"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char sniper"><div class="img"></div></div>');
  $($('.hex')[randHex()]).append('<div class="char sentry"><div class="img"></div></div>');

  $('.hex').each(function() {
    var num = $(this).children().length;
    $(this).addClass('chars'+num);
  });
  
  $('.char').each(function() {
    if (Math.floor(Math.random()*3) == 1) {
      $(this).addClass('highlight');
    }
  });
 }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}