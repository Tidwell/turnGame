function mapEditor() {
  var game = modules.gameaction.game;
  
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

  $('#map_editor').find('textarea').val($.toJSON(game.map));
  
  
  var getHexFromRel = function(rel) {
   
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

modules.mapEditor = new mapEditor;