/*
Module for handling user authentication
.setName = sets a users name attribute in the connectedUsers
*/


//assignment/loading //todo use passed in client path
var log = require('logging'); 

//Module Declaration
function auth(obj) {
  var auth = this;
  //create validName object
  var isValidName = require(obj.clientPath+'/shared/isValidName')
  var isValidName = new isValidName;
  obj.client.on('setName', function(obj) {
    auth.setName(obj)
  });
  
  /*
  *Called when a user sends a setName command
  *sets a user's name attribute in their entry in the connectedUsers object
  *@arg obj.
  *         client         client object
  *         args           the arguments the user sent with the message
  *             .name      name the player is requesting
  *         socket         the socket object
  *         connectedUsers object of connected users, indexed by session id
  *         games          array of all games
  */
  this.setName = function(obj) {
    if(isValidName.check(obj.args.name)) {
      obj.connectedUsers[obj.client.sessionId].name = obj.args.name;
      obj.client.send({type: 'nameSet', args: {name: obj.args.name}});
    }
  }
}

//declare the module
module.exports = auth;
