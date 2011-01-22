/*
Helper functions for http responses
*/


//assignments/loading
var 
    //node.js libraries
    url = require('url')
    //module libraries
  , log = require('logging');

//sends a 404 message
//@arg response object
exports.send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
}

/*gets the actual system file path based on a request object
 *@arg obj.
 *         req                resquest object
 *         clientFolderPath   path to the client-side code relative to the root dir, without leading or trailing /
*/
exports.getSystemPathFromRequest = function(obj){
  var   req = obj.req
      , clientFolderPath = obj.clientFolderPath
      
  //get the basic path, without the domain/port information
  var path = url.parse(req.url).pathname;
  //if the last character is a slash
	if (path.charAt(path.length-1) == '/') {
    //if it is a directory
    if (path.length > 1) {
      //we append index.html
      path += 'index.html';
    }
    else {
      //requesting the root url
      path = '/index.html';
    }
  }
  //set the full path from the system root
  //        util root/..up/..up/client folder/requested file path
  return __dirname + '/../../' + clientFolderPath + path;
}

/*sends a file over http
 *@arg obj.
 *         res    response object
 *         path   path to the file to send
 *         data   the data contained in the file at the path
*/
exports.sendFile = function(obj){
  var   res = obj.res
      , path = obj.path
      , data = obj.data
      
  //write the header 200 OK
	res.writeHead(200,{'Content-Type': mimeType(path)})
	//write the document as the data, using utf8-encoding
	res.write(data, 'utf8');
	//done with this HTTP request
	res.end();
}

//helper for determining mime-type
//mappings of file extensions to mime types
var mimeMappings = {
    js: 'text/javascript'
  , html: 'text/html'
  , css: 'text/CSS'
  , _default: 'text/plain'
}
//@arg any path with a file extension
var mimeType = function(path) {
  //get the extension (auto-to _default if multiple . in path/filename)
  var extension = path.split('.');
  var extension = extension[extension.length-1];
	//if a matching mimetype exists, return it otherwise return the default
  var mimeType = mimeMappings[extension];
  return (mimeType) ? mimeType : mimeMappings._default;
}
