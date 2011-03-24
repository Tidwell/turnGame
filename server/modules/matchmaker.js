/*
Module for handling matchmaking
*/

//assignment/loading
var 
      log = require('logging');

//Module Declaration
function matchmaker(obj) {
  var matchmaker = this;
  
  obj.client.on('joinGame', function(obj) {
    matchmaker.joinGame(obj)
  });
  obj.client.on('gameEnd', function(obj) {
    matchmaker.gameEnd(obj)
  });
  
  this.client = obj.client;
  
  
  /*
  *Called when a game broadcasts that it has ended.  Finds the corresponding game, unsets their inGame property and
  *removes the game from the games array
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.gameEnd = function(obj) {
    //make sure we have players we need to send to
    if (typeof obj.winner == 'object') {
      var i = 0;
      var winPlayer;
      if (obj.winner.length != undefined) {
        winPlayer = obj.winner[0].sessionId
      }
      else {
        winPlayer = obj.winner.sessionId
      }
      var game = obj.game;
      //we check and see if a game actually ended
      if (game) {
        game.players.forEach(function(player) {
          if (obj.connectedUsers[player.sessionId]) {
            obj.connectedUsers[player.sessionId].inGame = false;
          } 
        });
      }
      else {
        throw new Error('No game found after gameEnd event fired, how is that possible?');
      }
    }
    //delete the game that has ended
    var toDelete = game.gameIndex;
    obj.games.remove(toDelete);
  }
  
 /*
  *Called when a user sends a joinGame command
  *
  *@arg obj.
  *         client         client object
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.joinGame = function(obj) {
    //check they aren't in a game
    if (obj.connectedUsers[obj.client.sessionId].inGame == true) {
      obj.client.send({type: 'inGameError'});
      return false;
    }
    //otherwise
    //set their in-game flag
    obj.connectedUsers[obj.client.sessionId].inGame = true;
    
    var emptyGame = null;
    var i = 0;
    //find the first empty game
    obj.games.forEach(function(game) {
      if (game.getPlayers().length < game.minPlayers) {
        emptyGame = i;
      } 
      i++;
    });
    if (emptyGame != null) {
      //if we found a game
      obj.games[emptyGame].addPlayer({socket: obj.socket, client: obj.client, connectedUsers: obj.connectedUsers});
      return true;
    }
    //otherwise create a new game
    var g = new obj.gamestateTemplate
    g.init(matchmaker.client);
    g.addPlayer(obj);

    //add it to the global list of gamestates
    obj.games.push(g);
    var index = obj.games.length-1;
  }
  
  
  
}

//declare the module
module.exports = matchmaker;


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};