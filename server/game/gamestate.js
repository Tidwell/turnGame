/*
Gamestate class that is used by the gameaction module
*/
require.paths.unshift('system/');

var 
  log = require('logging'),
  characters = require('characters')

function gamestate(eventEmitter) {
  this.eventEmitter = eventEmitter;
  this.maxPlayers = 1;
  this.activePlayer = 0;
  this.players = [];
  this.map;
}

//set the inheratance to the system gamestate
gamestate.prototype = require('Gamestate').Gamestate;

/*
* Called at the start of the game
* Tells the players the player names
* Gives the players their characters
* Makes the map
* sets the active player ranomly and tells the players
*
*@arg obj.
*         client         client object
*         socket         the socket object
*         connectedUsers connectedUsers obj, keyed by sessionId
*/
gamestate.prototype.startGame = function(obj) {
  //tell the players the game begins
  this.sendAllPlayers({type: 'gameStart', args: {players: this.players}}, obj.socket);
  //tell both players the player names
  var playerNames = [];
  this.players.forEach(function(player) {
    var name = (obj.connectedUsers[player].name) ? obj.connectedUsers[player].name : 'Anonymous'
    playerNames.push(name);
  });
  this.sendAllPlayers({type: 'playerNames', args: {players: playerNames}}, obj.socket);
  //make the map
  this.makeMap(obj);
  //set the active player randomly and tell both players who the active player is
  this.activePlayer = this.players[Math.floor(Math.random()*this.maxPlayers)];
  this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
}

 /*
* Called at the start of the game
* Makes a map all at height 1 with blue/red starts at each side
* 
*
*@arg obj.
*         client         client object
*         socket         the socket object
*         connectedUsers connectedUsers obj, keyed by sessionId
*/
gamestate.prototype.makeMap = function(obj) {
  var map = {}
  map.hexes = [];
  var q = 0;
  while (q<8) {
    var i = 0;
    while (i<6) {
      if ((i==0 && q==0) ||
          (i==5 && q==7) 
         ) {
      }
      else {
        var z = Math.floor(Math.random()*3);
        var tileType = '_default';
        if (i==1 && q==0) tileType = 'startRed';
        if (i==4 && q==7) tileType = 'startBlue';
        map.hexes.push({
          x: q,
          y: i,
          z: (Math.floor(Math.random()*3) == 1) ? ((z==1) ? 1 : 1): 1,
          tileType: tileType
          
        })
      }
      i++;
    }
    q++;    
  }
  this.map = map;
  this.sendAllPlayers({type: 'renderMap', args: {map: this.map}}, obj.socket); 
}

gamestate.prototype.checkGameEnd = function() {
  var players = this.players;

  return false;
}

module.exports = gamestate
