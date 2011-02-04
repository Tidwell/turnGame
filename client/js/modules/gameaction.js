/*
Module for gamestate events, (aka gameaction)
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

function gameaction() {
  //to avoid this confusion
  var game = this;
  var myId;
  
  this.map;
  this.players;
  
  this.gameShow = function() {
    $('#gamestate').fadeIn();
  }
  
  /*
  *Called when a new game has begun
  *@arg     args           the arguments the server sent with the message
  */
  this.gameStart = function(args) {
    $('.characters li span, .characters li .img').remove();
    $('.characters li').append('<span></span><div class="img"></div>');
    myId = socket.transport.sessionid;
  }

  /*
  *Called when the server tells the players names
  *@arg     args           the arguments the server sent with the message
  *             .players   names of players in the game
  */
  
  this.playerInfo = function(args) {
   $('#gamestate ul.players li').remove();
   $(args.players).each(function() {
      $('#gamestate ul.players').append('<li rel="'+this.sessionId+'" class="'+this.color+'">'+this.name+'</li>');
    });
  }
  
  /*
  *Called when the active player changes
  *@arg     args           the arguments the server sent with the message
  *             .player    the players in the game
  */
  this.activePlayer = function(args) {
    $('#gamestate ul.players li').removeClass('active');
    $('#gamestate ul.players li[rel='+args.player.sessionId+']').addClass('active');
    if (args.player.sessionId == myId) {
      alert('Click a hex to move a random '+args.player.color+' character matching one of the types of characters in the hex');
      $('.hex').unbind().click(function() {
        var chars = $(this).children('.char');
        var toRel = $($('.hex')[Math.floor(Math.random()*($('.hex').length-1))]).attr('rel');
        if (toRel) {
          var to = {
            x: undefined,
            y: undefined
          };
          toRel = toRel.split('y');
          toRel[0] = toRel[0].replace('x','');
          to.x = toRel[0];
          to.y = toRel[1];
        }
        var character = $(chars[Math.floor(Math.random()*(chars.length-1))]).attr('rel');
        if (character && to.x && to.y) {
          socket.send({type: 'move', args: {
            character: character,
            to: to
          }});
          $('.hex').unbind();
        }
      });
    }
  }
  
  this.gameOver = function(args) {
    if (Number(socket.transport.sessionid) == args.winner.sessionId) {
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
    if ($('input[type=checkbox]:checked').length > 0) {
      $('.char').hide();
    }
  }
  var createHex = function(hex) {
    var q = hex.x;
    var i = hex.y;
    var domHex = $('<div class="hex"></div>').appendTo('#map #hexContainer');
    domHex.css('top', 0-(34*i)+(11*q));
    domHex.css('left', 0+(94*q)+(72*i));
    domHex.css('z-index', 10-i);
    domHex.data('column', q);
    domHex.data('row', i);
    domHex.attr('rel', 'x'+q+'y'+i);
    domHex.text('x'+q+'y'+i+'z'+hex.z);
    domHex.addClass(hex.tileType);
    return domHex;
  }
  
  this.charClasses = function() {
    $('.hex').removeClass('chars1').removeClass('chars2').removeClass('chars3').removeClass('chars4plus');
    $('.hex').each(function() {
      //get the class to append
      var num = $(this).children('.char').length;
      if (num > 0) {
        num = (num>3) ? 'chars4plus'  : 'chars'+num;
        $(this).addClass(num);
        //if its more than 3 append the more class
        if (num == 'chars4plus') {
          $(this).append('<div class="more"></div>');
          if (
            $(this).children('.chars').hasClass('blueTeam') &&
            $(this).children('.chars').hasClass('redTeam')
            ) {
              console.log('rearange');
            }
        }
      }
    });
  }
  
  this.characters = function(args) {
    $('.char').remove();
    this.players = args.players;
    $(args.players).each(function() {
      var player = this;
      var totalHealth = 0;
      $(this.characters).each(function() {
        var character = this;
        totalHealth += Math.floor(character.health/2);
          $('.hex[rel=x'+character.position.x+'y'+character.position.y+']')
            .append('<div rel="'+character.name+'" class="char '+character.name+' '+character.color+'Team"><div class="img"></div></div>');
      })
      //$('.characters.'+player.color).width(totalHealth);
    });
    this.charClasses();
    this.renderHealth();
    //console.log(args);
  }
  
  this.renderHealth = function() {
    $(this.players).each(function() {
      var player = this;
      $('.characters.'+player.color+' li').hide();
      $(this.characters).each(function() {
        var character = this;
        $('.characters.'+player.color+' .'+character.name+'thumb').show().width(Math.floor(character.health/2)).find('span').html(character.health);
      });
    });
  }
  
  this.move = function(character) {
    var hex = $('.hex[rel=x'+character.position.x+'y'+character.position.y+']');
    var sel = '.'+character.color+'Team.'+character.name;
    var character = $(sel);
    character.appendTo(hex);
    this.charClasses();
  }
  
  this.notYourTurn = function(args) {
    alert('Its not your turn');
  }
    
/*    $('.char').each(function() {
      if (Math.floor(Math.random()*3) == 1) {
        $(this).addClass('highlight');
      }
    });
*/
  
  
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
  
  editor.draggable();
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

}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
modules.gameaction = new gameaction;
