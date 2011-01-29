/*
Module for a gamestate
*/


var 
      log = require('logging');

function gamestate(eventEmitter) {
  /* REQUIRED ON EVERY MODULE
  *Called when the module is loaded, sets up event listeners
  *@arg eventEmitter    the event emitter object to attach events to
  */
  this.eventEmitter = eventEmitter;
  
  this.listen = function(eventEmitter) {

  }

  this.activePlayer = 0;
  this.players = [];
  this.board = 
  [
  [' ',' ',' '],
  [' ',' ',' '],
  [' ',' ',' ']
  ]
  
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
    if (this.players.length == 2) {
      //tell the players the game begins
      this.sendAllPlayers({type: 'gameStart', args: {players: this.players}}, obj.socket);
      var playerNames = [];
      this.players.forEach(function(player) {
        var name = (obj.connectedUsers[player].name) ? obj.connectedUsers[player].name : 'Anonymous'
        playerNames.push(name);
      });
      this.sendAllPlayers({type: 'playerNames', args: {players: playerNames}}, obj.socket);
      //init the game
      this.beginGame(obj.socket);
    }
  }
  
  this.beginGame = function(socket) {
    this.activePlayer = this.players[Math.floor(Math.random()*2)];
    this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, socket);
  }
  
  this.placeLetter = function(obj) {
    //find out if the command comes from the active player
    if (obj.client.sessionId == this.activePlayer) {
      //get the current value on the board at the position
      var boardPosition = this.board[obj.args.y][obj.args.x];
      if (boardPosition == ' ') { //empty
        if (this.players[0] == obj.client.sessionId) {
          boardPosition = 'X';
        }
        else {
          boardPosition = 'O'
        }
        //set the value on the board
        this.board[obj.args.y][obj.args.x] = boardPosition;
        //tell the players
        this.sendAllPlayers({type: 'boardUpdate', args: {change: obj.args, value: boardPosition}}, obj.socket);
        var isWinner = this.checkGameEnd();
        if (isWinner != false) {
          obj.winner = isWinner
          this.gameOver(obj);
          return false;
        }
        //change the active player
        this.activePlayer = (boardPosition=='X') ? this.players[1] : this.players[0];
        //tell the players
        this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
      }
    }
  }
  
  this.gameOver = function(obj) {
    this.sendAllPlayers({type: 'gameOver', args: {winner: obj.winner}}, obj.socket);
    this.eventEmitter.emit('gameEnd', obj);
  }
  
  this.checkGameEnd = function() {
    var players = this.players;
    var nullToken = ' ';
    
    //rows
    var numRows = this.board.length;
    var i = 0;
    while (i< numRows) {
      var row = this.board[i];
      if ((row[0] == row[1] && row[0] == row[2]) && row[0] != nullToken) {
        //game over
        return toReturn = (row[0] == 'X') ? players[0] : players[1];
      }
      i++;
    }
    
    //columns
    var i = 0;
    var numCols = this.board[0].length;
    while (i<numCols) {
      if (this.board[0][i] == this.board[1][i] && this.board[0][i] == this.board[2][i] && this.board[0][i] != nullToken) {
        return (this.board[0][i] == 'X') ? players[0] : players[1];
      }      
      i++;
    }
    
    //diagonals
    if (this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2] && this.board[0][0] != nullToken) {
      //game over
      return (this.board[0][0] == 'X') ? this.players[0] : this.players[1];
    }
    if (this.board[2][0] == this.board[1][1] && this.board[2][0] == this.board[0][2] && this.board[2][0] != nullToken) {
      //game over
      return (this.board[2][0] == 'X') ? this.players[0] : this.players[1];
    }
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
