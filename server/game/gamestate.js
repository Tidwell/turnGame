/*
Gamestate class that is used by the gameaction module
*/
require.paths.unshift('system/');

var 
  log = require('logging'),
  characters = require('characters'),
  maps = require('maps.js');
  
function gamestate(eventEmitter) {
  this.eventEmitter = eventEmitter;
  this.maxPlayers = 1;
  this.activePlayer = 0;
  this.players = [];
  this.map;
  this.spawnPoints = {blue: undefined, red: undefined};
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
  var i = 0;
  this.players.forEach(function(player) {
    //determine the players name or set it to a default if they don't have one
    var name = (obj.connectedUsers[player.sessionId].name) ? obj.connectedUsers[player.sessionId].name : 'Anonymous'
    player.name = name;
    player.color = (i===0) ? 'red' : 'blue';
    player.ap = 0;
    i++;
  });
  //tell both players the player names
  this.sendAllPlayers({type: 'playerInfo', args: {players: this.players}}, obj.socket);
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
  var game = this;
  this.players.forEach(function(player) {
    var chars = new characters;
    player.characters = [  
      chars.spy,
      chars.sniper,
      chars.scout,
      chars.medic,
      chars.heavy,
      chars.engineer,
      chars.demo,
      chars.pyro,
      chars.soldier
    ];
    var x = game.getSpawn(player.color).x;
    var y = game.getSpawn(player.color).y;
    var i = 0;
    var len = player.characters.length;
    while (i<len) {
      player.characters[i].color = player.color;
      player.characters[i].position.x = x;
      player.characters[i].position.y = y;
      i++;
    }
  });
  this.sendAllPlayers({type: 'characters', args: {players: game.players}}, obj.socket);
} 

//accepts a string color 'blue' or 'red'
//returns & caches (this.spawnPoints[color])
//the last instance in the map array matching the tileType of {color}start
gamestate.prototype.getSpawn = function(color) {
  var spawnPoint;
  this.map.hexes.forEach(function(hex) {
    var tileType = hex.tileType;
    if (tileType.toLowerCase() == 'start'+color) {
      spawnPoint = hex;
    }
  });
  return spawnPoint;
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
  this.map = maps.onefort;
  this.sendAllPlayers({type: 'renderMap', args: {map: this.map}}, obj.socket); 
}

gamestate.prototype.checkGameEnd = function() {
  return false;
}

gamestate.prototype.move = function(obj) {
  if (obj.client.sessionId != this.activePlayer.sessionId) {
    this.sendPlayer({type: 'notYourTurn'}, obj.client.sessionId,obj.socket);
  }
  var characterName = obj.args.character;
  var to = obj.args.to;
  var player = this.getPlayerBySessionId(obj.client.sessionId);
  var character = this.getCharacter(player, characterName);
  character.position.x = to.x;
  character.position.y = to.y;
  this.sendAllPlayers({type: 'move', args: character}, obj.socket);
  this.rotateActive(obj);
}

gamestate.prototype.rotateActive = function(obj) {
  var game = this;
  var i = 0;
  var set = false;
  game.players.forEach(function(player) {
    if (game.activePlayer.sessionId == player.sessionId && set == false) {
      set = true;
      if (i == 0) {
        game.activePlayer = game.players[1];
      }
      else {
        game.activePlayer = game.players[0];
      }
    }
    i++;
  });
  game.sendAllPlayers({type: 'activePlayer', args: {player: game.activePlayer}}, obj.socket);
}

gamestate.prototype.getCharacter = function(player, name) {
  var toReturn;
  player.characters.forEach(function(character) {
    if (character.name == name) {
      toReturn = character;
    }
  });
  return toReturn;
}

module.exports = gamestate
