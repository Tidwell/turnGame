/*
Module for handling user authentication
  .setName = sets a user's name attribute in the connectedUsers
*/

//Module Declaration
function auth(obj) {
  var auth = this;
  this.clientPath = obj.clientPath;
  
  //listen for when a client sends a setName command, 
  //and pass it through (we could do validation here)
  obj.client.on('setName', function(obj) {
    auth.setName(obj)
  });
  
  /*
  Called when a user sends a setName command
  sets a user's name attribute in their entry in the connectedUsers object
  tells the player that their name was set
  if they are in a game, tells all players that their name has changed
  @arg obj.
            client         client object
            args           the arguments the user sent with the message
                .name      name the player is requesting
            socket         the socket object
            connectedUsers object of connected users, indexed by session id
            games          array of all games
            game           game the user is currently in
  */
  this.setName = function(obj) {
    //make sure they submitted a valid name
    var isValidName = require(auth.clientPath+'/shared/isValidName')
    var isValidName = new isValidName;

    if(isValidName.check(obj.args.name)) {
      //set their name in the system's list of users
      obj.connectedUsers[obj.client.sessionId].name = obj.args.name;
      //tell the user that their name changed
      obj.client.send({type: 'nameSet', args: {name: obj.args.name}});
      //if the user is in a game, we will have the game here as obj.game, so we might 
      //as well tell everyone that they changed their name
      if (obj.game) {
        obj.game.sendAllPlayers(
          { type: 'playerNameChange', 
            args: {
              name: obj.args.name, 
              id: obj.client.sessionId
            }
          },
        obj.socket)
      }
    }
  }
  
  
}

//declare the module
module.exports = auth;
