/*
Provides basic functionality for gamestate
getPlayers
sendAllPlayers
sendToPlayers
gameOver
addPlayer
listen (in case the gamestate doesn't listen for anything)

*/
function Gamestate() {
  this.eventEmitter;
  this.maxPlayers;
  
  //returns the players in the game 
  this.getPlayers = function() {
    return this.players; 
  }
  
  //Sends a message to all players in a game
	//accepts an object and a socket
	//Sends the object to the clients via the socket
	this.sendAllPlayers = function(obj, socket) {
    this.players.forEach(function(player) {
			socket.clients[player.sessionId].send(obj);
		});
	}
	
	//Sends a message to a single player in a game
	//accepts an object and the players sessionId, and a socket
	//Sends the object to the client via the socket
	this.sendToPlayer = function(obj, player, socket) {
		socket.clients[player.sessionId].send(obj);
	}
  
  //sends a game over event to the players and sends out the event
  this.gameOver = function(obj) {
    this.sendAllPlayers({type: 'gameOver', args: {winner: obj.winner}}, obj.socket);
    this.eventEmitter.emit('gameEnd', obj);
  }
  
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
    this.players.push({sessionId: obj.client.sessionId});
    //if the game has 2 players in it
    if (this.players.length == this.maxPlayers) {
      this.startGame(obj)
    }
  }
  
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.listen = function(eventEmitter) {

  }

}

exports.Gamestate = new Gamestate;