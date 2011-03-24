//assignments/loading
var 
    //node.js libraries
    fs = require('fs')
  , sys = require('sys')
  //module libraries
  , log = require('logging')
  //other vars
  , server
  
//custom objects  
var socketUtil = require('./util/socketUtil.js')
var moduleLoader = require('./util/moduleLoader.js');
var messageEventEmitter = require('./util/moduleEventEmitter')

function generalGameServer(obj) {
  
};

/*
Creates the basic http and socket servers
Uses socketUtil to create/handle incomming socket messages
Uses modulLoader to load up all the defined modules
Uses moduleEventEmitter to create a global eventlistener (exposed to modules as .client)
*/
generalGameServer.prototype.createServer = function(obj) {
  var io = require('socket.io')

  //path to where all the front-end code lives (html/css/js)
  var clientFolderPath = obj.server.clientDir ? obj.server.clientDir : 'client';
  
  //require the system and user gamestates
  var systemGamestate = require('./system/Gamestate').Gamestate;
  var userGamestate = require(process.cwd()+'/server/game/gamestate').gamestate;
  userGamestate.prototype = systemGamestate;
  
  //instantiate a new global event emitter that will be passed around to all the modules like a whore.
  var moduleEventEmit = new messageEventEmitter;
  
  //define the object that will be passed into the helper modules
  var helperObj = {
    clientFolderPath: clientFolderPath,
    moduleEventEmitter: moduleEventEmit,
    gamestateTemplate: userGamestate,
    gameSettings: obj.game,
  }
  
  //init the helper modules
  socketUtil.init(helperObj)
  moduleLoader.init(helperObj)
  
  //Use node-static to create a static http server
  //see: https://github.com/cloudhead/node-static
  if (obj.server.serveHttp) {
    var static = require('node-static');
    var file = new(static.Server)(helperObj.clientFolderPath);
    var http = require('http');
    
    server = http.createServer(function (request, response) {
      request.addListener('end', function () {
        file.serve(request, response);
      });
    })
    server.listen(8080);
  }
  
  //if they want to use something like express or whatever, we need the server info so
  //that socket.io can hijack the folders it needs to serve the client socket-io scripts
  else {
    server = obj.server.server;
  }

  //set up socket server
  var io = io.listen(server);

  //when connected
  io.on('connection', function(client){
    //handle the user connecting
    socketUtil.connect({client: client, socket: io, gamestateTemplate: userGamestate});
     
    //setup the message event listener for when a message is recieved from the client
    client.on('message', function(message){
      //pass it to the handler
      socketUtil.message({client: client, message: message, socket: io, gamestateTemplate: userGamestate});
    });

    //on disconnect
    client.on('disconnect', function(){
      //tell the handler that the user diconnected
      socketUtil.disconnect({client: client, socket: io, gamestateTemplate: userGamestate});
    });
  });
  
  return {
    modules: moduleLoader.modules,
    gamestateTemplate: new userGamestate,
    httpServer: server,
    socket: io
  }

}

module.exports = new generalGameServer;