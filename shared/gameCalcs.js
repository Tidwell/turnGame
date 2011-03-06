//if included by the client, we declare a new class
function gameCalcs() {
  //private methods
  //hex is string 'x#y#'
  //map is full map data
  var getAdjacentHexes = function(hex, map) {
    return map.hexes;
  }
  
  return {
    //public methods
    //hex is string 'x#y#'
    //map is full map data {hexes: [{tileType: '', x: #, y: #, z: #}, {...}]}
    validMoveableHexes: function(hex, map) {
      return getAdjacentHexes(hex,map);
    },
  };
}

//if the server includes us, we need a constructor
if (typeof exports != 'undefined') {
  module.exports = gameCalcs;
}