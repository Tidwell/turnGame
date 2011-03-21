/*
Gamestate class that is used by the gameaction module
This is an example of a 2-player Tic-Tac-Toe game
*/
require.paths.unshift('system/');

var 
  log = require('logging');
  
function gamestate(eventEmitter) {
  this.eventEmitter = eventEmitter;
  
  /*Set the Required Gamestate Options*/
  this.type = 'multipleWorld'; //we want multiple tic-tac-toe games
  this.timing = 'turnBased'; //tic-tac-toe is turn based
  this.endable = true; //and the games can end 
  this.minPlayers = 2; //the minimum number of players for a game is 2
  
  /*Set my tic-tac-toe specific variables (stuff here will be in every instance of a gamestate)*/
  this.board = 
  [
  [' ',' ',' '],
  [' ',' ',' '],
  [' ',' ',' ']
  ]
  
  /*Stuff specific to this gamestate*/
  this.activePlayer = {};
  this.players = [];


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
      var gameOver = this.checkGameEnd(obj);
      if (!gameOver) {
        //change the active player
        this.activePlayer = (boardPosition=='X') ? this.players[1] : this.players[0];
        //tell the players
        this.sendAllPlayers({type: 'activePlayer', args: {player: this.activePlayer}}, obj.socket);
      }
    }
  }
}

 
gamestate.prototype.checkGameEnd = function(obj) {
  var gameOver = false;
  var winner = null;
  var players = this.players;
  
  log('players------------>');
  log(players);
  //check if we no longer have enough players, and there are players left
  if (players.length < this.minPlayers && players.length > 0) {
    gameOver = true;
    winner = players;
  }
  //check if we have 0 players left in this game
  if (players.length == 0) {
    log('everyone disco');
    gameOver = true;
    winner = 'allPlayerDisconnect';
  }
  
  //define a null token on the board to check against
  var nullToken = ' ';
  //rows
  var numRows = this.board.length;
  var i = 0;
  while (i< numRows) {
    var row = this.board[i];
    if ((row[0] == row[1] && row[0] == row[2]) && row[0] != nullToken) {
      //game over
      gameOver = true;
      winner = toReturn = (row[0] == 'X') ? players[0] : players[1];
    }
    i++;
  }
  
  //columns
  var i = 0;
  var numCols = this.board[0].length;
  while (i<numCols) {
    if (this.board[0][i] == this.board[1][i] && this.board[0][i] == this.board[2][i] && this.board[0][i] != nullToken) {
      gameOver = true;
      winner = (this.board[0][i] == 'X') ? players[0] : players[1];
    }      
    i++;
  }
  
  //diagonals
  if (this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2] && this.board[0][0] != nullToken) {
    //game over
    gameOver = true;
    winner =  (this.board[0][0] == 'X') ? this.players[0] : this.players[1];
  }
  if (this.board[2][0] == this.board[1][1] && this.board[2][0] == this.board[0][2] && this.board[2][0] != nullToken) {
    //game over
    gameOver = true;
    winner =  (this.board[2][0] == 'X') ? this.players[0] : this.players[1];
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
  if (allFilled) {
    gameOver = true;
    winner = 'tie';
  }
  
  if (gameOver != false) {
    //otherwise someone won
    obj.winner = winner
    this.gameOver(obj);
  }
  return gameOver;
}
module.exports = gamestate
