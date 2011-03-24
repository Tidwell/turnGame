function generalGameServer(obj) {
  
};

generalGameServer.prototype.createServer = function(obj) {
  /*
  Creates the basic http and socket servers
  Uses util classes to handle those requests

  http requests are routed through util/httpUtil.js
  socket requests are routed through util/socketUtil.js
  */

  //assignments/loading
  var 
      //node.js libraries
      fs = require('fs')
    , sys = require('sys')
    , server
    //module libraries
    , io = require('socket.io')
    , log = require('logging');

  //custom objects  
  var socketUtil = require('./util/socketUtil.js')

  //path to where all the front-end code lives (html/css/js)
  var clientFolderPath = obj.server.clientDir ? obj.server.clientDir : 'client';
  
  socketUtil.setClientPath(clientFolderPath);
  socketUtil.load();
  
  //require the system and user gamestates - we have to call new inside of the gamestate in order to grab prototyped funcs
  var systemGamestate = require('./system/Gamestate').Gamestate;
  var userGamestate = require(process.cwd()+'/server/game/gamestate').gamestate;
  userGamestate.prototype = systemGamestate;
  
    
  //todo accept serveHttp arg from passed in object and convert to use simple http (maybe with jqtpl)
  
  if (obj.server.serveHttp) {
    var http = require('http');
    var httpUtil = require('./util/httpUtil.js');
    //create the http server
    var server = http.createServer(function(req, res){
      //when we get a HTTP request
      //get the requested system path
      var systemPath = httpUtil.getSystemPathFromRequest({
        clientFolderPath: clientFolderPath, 
        req: req
      });
      //try to grab the file
      fs.readFile(systemPath, function(err, data){
        //if the file cannot be found
        if (err) {
          //send the client a 404 response
          httpUtil.send404(res);
          return;
        }
        //else, we can send back the file that maps to the requested url    
        httpUtil.sendFile({res: res, data: data, path: systemPath});
        return;
      });
    });

    //listen
    server.listen(8080);
  }
  else {
    var server = obj.server.server;
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
    modules: socketUtil.mods,
    gamestateTemplate: new userGamestate
  }

}

module.exports = new generalGameServer;