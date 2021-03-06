/*
Gamestate class that is used by the gameaction module
This is an example of a 2-player Tic-Tac-Toe game
*/
require.paths.unshift('system/');

var 
  log = require('logging');
  
function gamestate(eventEmitter) {
  this.eventEmitter = eventEmitter;
  this.maxPlayers = 2;
  this.activePlayer = {};
  this.players = [];
  this.board = 
  [
  [' ',' ',' '],
  [' ',' ',' '],
  [' ',' ',' ']
  ]

}

//set the inheratance to the system gamestate
gamestate.prototype = require('Gamestate').Gamestate;


/*
* Called at the start of the game
* Tells the players the player names
* sets the active player ranomly and tells the players
*
*@arg obj.
*         client         client object
*         socket         the socket object
*         connectedUsers connectedUsers obj, keyed by sessionId
*/
gamestate.prototype.startGame = function(obj) {
  this.started = true;
  this.sendAllPlayers({type: 'gameStart', args: {players: this.players}}, obj.socket);
  var playerNames = [];
  this.players.forEach(function(player) {
    var name = (obj.connectedUsers[player.sessionId].name) ? obj.connectedUsers[player.sessionId].name : 'Anonymous'
    playerNames.push(name);
  });
  this.sendAllPlayers({type: 'playerNames', args: {players: playerNames}}, obj.socket);
  
  this.activePlayer = this.players[Math.floor(Math.random()*2)];
  this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
}

gamestate.prototype.placeLetter = function(obj) {
  //find out if the command comes from the active player
  if (obj.client.sessionId == this.activePlayer.sessionId) {
    //get the current value on the board at the position
    var boardPosition = this.board[obj.args.y][obj.args.x];
    if (boardPosition == ' ') { //empty
      if (this.players[0].sessionId == obj.client.sessionId) {
        boardPosition = 'X';
      }
      else {
        boardPosition = 'O'
      }
      //set the value on the board
      this.board[obj.args.y][obj.args.x] = boardPosition;
      //tell the players
      this.sendAllPlayers({type: 'boardUpdate', args: {change: obj.args, value: boardPosition}}, obj.socket);
      var isWinner = this.checkGameEnd(obj);
      if (!isWinner) {
        //change the active player
        this.activePlayer = (boardPosition=='X') ? this.players[1] : this.players[0];
        //tell the players
        this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
      }
    }
  }
}


gamestate.prototype.checkGameEnd = function(obj) {
  var winning = false;
  
  var players = this.players;
  //check if we no longer have enough players
  if (players.length < this.maxPlayers) {
    winning = players[0];
  }
  
  var nullToken = ' ';
  
  //rows
  var numRows = this.board.length;
  var i = 0;
  while (i< numRows) {
    var row = this.board[i];
    if ((row[0] == row[1] && row[0] == row[2]) && row[0] != nullToken) {
      //game over
      winning = toReturn = (row[0] == 'X') ? players[0] : players[1];
    }
    i++;
  }
  
  //columns
  var i = 0;
  var numCols = this.board[0].length;
  while (i<numCols) {
    if (this.board[0][i] == this.board[1][i] && this.board[0][i] == this.board[2][i] && this.board[0][i] != nullToken) {
      winning = (this.board[0][i] == 'X') ? players[0] : players[1];
    }      
    i++;
  }
  
  //diagonals
  if (this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2] && this.board[0][0] != nullToken) {
    //game over
    winning = (this.board[0][0] == 'X') ? this.players[0] : this.players[1];
  }
  if (this.board[2][0] == this.board[1][1] && this.board[2][0] == this.board[0][2] && this.board[2][0] != nullToken) {
    //game over
    winning = (this.board[2][0] == 'X') ? this.players[0] : this.players[1];
  }
  
  //check for the tie
  var allFilled = true;
  this.board.forEach(function(row) {
    row.forEach(function(square) {
      if (square == ' ') {
        allFilled = false;
      }
    });
  });
  if (allFilled) winning = 'tie';
  
  var isWinner = winning;

  if (isWinner != false) {
    if (isWinner == 'tie') {
      obj.winner = 'tie';
      this.gameOver(obj);
    }
    //otherwise someone won
    obj.winner = isWinner
    this.gameOver(obj);
  }
  return isWinner;
}
module.exports = gamestate
