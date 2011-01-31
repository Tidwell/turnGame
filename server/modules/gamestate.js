/*
Module for a gamestate
*/

require.paths.unshift('system/');

var 
      log = require('logging');
      characters = require('characters');

function gamestate(eventEmitter) {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.eventEmitter = eventEmitter;
  
  this.listen = function(eventEmitter) {

  }

  this.maxPlayers = 1;
  this.activePlayer = 0;
  this.players = [];
  this.map;
  
  /*
  *Adds a player to the game.  If the game is full, begins the game
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers connectedUsers obj, keyed by sessionId
  */
  this.addPlayer = function(obj) {
    //add the player to the game
    this.players.push(obj.client.sessionId);
    //if the game has 2 players in it
    if (this.players.length == this.maxPlayers) {
      //tell the players the game begins
      this.sendAllPlayers({type: 'gameStart', args: {players: this.players}}, obj.socket);
      var playerNames = [];
      this.players.forEach(function(player) {
        var name = (obj.connectedUsers[player].name) ? obj.connectedUsers[player].name : 'Anonymous'
        playerNames.push(name);
      });
      this.sendAllPlayers({type: 'playerNames', args: {players: playerNames}}, obj.socket);
      //init the game
      this.makeMap(obj);
      this.beginGame(obj.socket);
    }
  }
  
  this.makeMap = function(obj) {
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
  
  
  this.beginGame = function(socket) {
    this.activePlayer = this.players[Math.floor(Math.random()*this.maxPlayers)];
    this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, socket);
  }
  
 
  
  
  
  this.gameOver = function(obj) {
    this.sendAllPlayers({type: 'gameOver', args: {winner: obj.winner}}, obj.socket);
    this.eventEmitter.emit('gameEnd', obj);
  }
  
  this.checkGameEnd = function() {
    var players = this.players;
  
    return false;
  }
  
  //returns the players in the game 
  this.getPlayers = function() {
    return this.players;
  }
  
  //Sends a message to all players in a game
	//accepts an object and a socket
	//Sends the object to the clients via the socket
	this.sendAllPlayers = function(obj, socket) {
    this.players.forEach(function(player) {
			socket.clients[player].send(obj);
		});
	}
	
	//Sends a message to a single player in a game
	//accepts an object and the players sessionId, and a socket
	//Sends the object to the client via the socket
	this.sendToPlayer = function(obj, id, socket) {
		socket.clients[id].send(obj);
	}
}

module.exports = gamestate
