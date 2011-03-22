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
      http = require('http')
    , fs = require('fs')
    , sys = require('sys')
    , server
    //module libraries
    , io = require('socket.io')
    , log = require('logging');

  //custom objects  
  var httpUtil = require('./util/httpUtil.js')
    , socketUtil = require('./util/socketUtil.js')

  //path to where all the front-end code lives (html/css/js)
  var clientFolderPath = obj.server.clientDir ? obj.server.clientDir : 'client';

  //todo accept serveHttp arg from passed in object and convert to use simple http (maybe with jqtpl)
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
 
  //set up socket server
  var io = io.listen(server);

  //when connected
  io.on('connection', function(client){
    //handle the user connecting
    socketUtil.connect({client: client, socket: io});
     
    //setup the message event listener for when a message is recieved from the client
    client.on('message', function(message){
      //pass it to the handler
      socketUtil.message({client: client, message: message, socket: io});
    });

    //on disconnect
    client.on('disconnect', function(){
      //tell the handler that the user diconnected
      socketUtil.disconnect({client: client, socket: io});
    });
  });
  
  return {
    modules: socketUtil.mods
  }

}

module.exports = new generalGameServer;