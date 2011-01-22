/*
This creates the basic http and socket servers
and defines generic classes to handle those requests

http requests are routed through util/httpHelper.js
socket requests are routed through classes/socketHandler.js
*/


//add our require paths to the require array
require.paths.unshift('util/');
require.paths.unshift('classes/'); //application log resides

//assignments/loading
var 
    //node.js libraries
    http = require('http')
  , fs = require('fs')
  , sys = require('sys')
  , server
  //module libraries
  , io = require('socket.io')
  , log = require('logging')
  
  //custom objects  
  , httpHelper = require('httpHelper.js')
  , socketHandler = require('socketHandler.js')

//path to where all the front-end code lives (html/css/js)
//relative to the root dir, without leading or trailing /
var clientFolderPath = 'client';

//create the http server
var server = http.createServer(function(req, res){
	//when we get a HTTP request
  //get the requested system path
	var systemPath = httpHelper.getSystemPathFromRequest({
    clientFolderPath: clientFolderPath, 
    req: req
  });
  //try to grab the file
  fs.readFile(systemPath, function(err, data){
    //if the file cannot be found
    if (err) {
      //send the client a 404 response, done with http
      httpHelper.send404(res);
      return;
    }
    //else, we can send back the file that maps to the requested url    
    httpHelper.sendFile({res: res, data: data, path: systemPath});
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
  socketHandler.connect({client: client});
  
  //setup the message event listener for when a message is recieved from the client
  client.on('message', function(message){
    //pass it to the handler
		socketHandler.message({client: client, message: message});
	});

  //on disconnect
	client.on('disconnect', function(){
    //tell the handler that the user diconnected
    socketHandler.disconnect({client: client});
  });
	
});
