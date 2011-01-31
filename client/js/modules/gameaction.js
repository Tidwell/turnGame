/*
Module for gamestate events, (aka gameaction)
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

function gameaction(socket) {
  //to avoid this confusion
  var game = this;
  this.map;
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
        tileType: string, classname to give hex
      },
    ]
  }
  */
  this.renderMap = function(args) {
  var i = 0;
  $('.hex').remove();
    args.map.hexes.forEach(function(hex) {
      //create it
      var domHex = createHex(hex);
      
      //args.map.hexes[i].domHex = domHex;

      //for some reason we will setTimeout this.  It will need to be
      //use the animation queue eventually...
      setTimeout(function() {
        //animate the hex up 18 px for each level
        if (hex.z > 0) {
          var amnt = 18*(hex.z);
          $(domHex).animate({
             top: '-='+amnt
          },100);
        }
      }, 500);
      i++;
    });
    this.map = args.map;

    $('#map_editor').find('textarea').val($.toJSON(game.map));
    finish();
    if ($('input[type=checkbox]:checked').length > 0) {
      $('.char').hide();
    }
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
    hex.text('x'+q+'y'+i+'z'+obj.z);
    hex.addClass(obj.tileType);
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
  
  
  
  
  var editor = $('#map_editor');
  editor.find('input[type=checkbox]').change(function() {
    $('.char').toggle();
  })
  $('.reset').click(function() {
    if (confirm('Are you sure you want to reset the board to 1-height?')) {
      var i = 0;
      $(game.map.hexes).each(function(hex) {
        game.map.hexes[i].z = 1;
        i++;
      });
      game.renderMap({map: game.map});
    }
  });
  
  editor.find('button.load').show().click(function() {
    var newMap = editor.find('textarea').val();
    if ($.parseJSON(newMap)) {
      game.map = $.parseJSON(newMap);
      game.renderMap({map: game.map});
    }
  });
  
  editor.find('button.remove').click(function() {
    if (!selectedHex) return;
    var hex = getHexFromRel($(selectedHex).attr('rel'));
    var i = 0;
    $(game.map.hexes).each(function() {
      if (hex.x == this.x && hex.y == this.y) {
        game.map.hexes.remove(i);
      }
      i++;
    });
    game.renderMap({map: game.map});
  })
  
  var selectedHex;
  $('.hex').live('click', function() {
    editor.find('.selected span').html($(this).attr('rel'));
    selectedHex = $(this);
    var hex = getHexFromRel($(selectedHex).attr('rel'));
    editor.find('option').each(function() {
      $(this).attr('selected', '');
      if ($(this).val() == hex.tileType) {
        $(this).attr('selected', 'selected');
      }
    });
  });
  
  editor.find('select').change(function() {
    if (!selectedHex) return;
    var hex = getHexFromRel($(selectedHex).attr('rel'));
    hex.tileType = $(this).val();
    game.renderMap({map: game.map});
  });
  
  editor.find('button').show().click(function() {
    if (!selectedHex) return;
    var delta = undefined;
    if ($(this).hasClass('up')) {
      delta = 1;
    }
    else if ($(this).hasClass('down')) {
      delta = -1;
    }
    if (typeof delta === 'number') {
      var hex = getHexFromRel($(selectedHex).attr('rel'));
      hex.z = hex.z+delta;
      game.renderMap({map: game.map});
    }
  });


  function getHexFromRel(rel) {
    var i = 0;
    var toReturn;
    $(game.map.hexes).each(function() {
      var thisRel = 'x'+this.x+'y'+this.y;
      if (rel == thisRel) {
        toReturn = game.map.hexes[i]
      }
      i++;
    });
    return toReturn;
  }
  
  
  

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
}; 
  
  
  
}