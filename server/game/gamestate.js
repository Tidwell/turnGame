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
* Makes the map
* Gives the players their characters
* sets the active player ranomly and tells the players
*
*@arg obj.
*         client         client object
*         socket         the socket object
*         connectedUsers connectedUsers obj, keyed by sessionId
*/
gamestate.prototype.startGame = function(obj) {
  //tell the players the game begins
  this.sendAllPlayers({type: 'gameStart', args: {}}, obj.socket);
  this.players.forEach(function(player) {
    //determine the players name or set it to a default if they don't have one
    var name = (obj.connectedUsers[player.sessionId].name) ? obj.connectedUsers[player.sessionId].name : 'Anonymous'
    player.name = name;
  });
  //tell both players the player names
  this.sendAllPlayers({type: 'playerNames', args: {players: this.players}}, obj.socket);
  //make the map
  this.makeMap(obj);
  this.addCharacters(obj); 
  //set the active player randomly and tell both players who the active player is
  this.activePlayer = this.players[Math.floor(Math.random()*this.maxPlayers)];
  this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
}

/*
* Called at the start of the game
* Gives the players their characters and tells both players the characters
*
*@arg obj.
*         client         client object
*         socket         the socket object
*         connectedUsers connectedUsers obj, keyed by sessionId
*/

gamestate.prototype.addCharacters = function(obj) {
  this.players.forEach(function(player) {
    player.characters = [  
      characters.spy,
      characters.sniper,
      characters.scout,
      characters.medic,
      characters.heavy,
      characters.engineer,
      characters.demo,
      characters.pyro,
      characters.soldier
    ]
  });
  this.sendAllPlayers({type: 'characters', args: {players: this.players}}, obj.socket);
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
  return false;
}

module.exports = gamestate
