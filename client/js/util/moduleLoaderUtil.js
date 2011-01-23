//create object to hold the modules, keyed by name
//this is in global scope so the modules can all access it
var modules = {};


var moduleLoaderUtil = function(socket) { 
  this.load = function(callback) {
    //get the list of modules to load (from shared class included on index)
    var moduleList = new modulesToLoad;
        
    //load each module
    moduleList.forEach(function(moduleName) {
      $.getScript('/js/modules/'+moduleName+'.js', function(){ moduleLoadComplete(moduleName) });
    });
    var totalLoadedModules = 0;
    var eventListeners = {};
    
    var moduleLoadComplete = function(moduleName) {
      //initialize the module 
      //--- DIRTY UGLY EVAL, so we make sure the module name only contains numbers and letters
      var regex=/^[a-zA-Z0-9]+$/;
      if(!regex.test(moduleName)) return;
      //if it passed, we create it using eval *bleh*
      var module = eval('new '+moduleName+'(socket)');
      //add it to the module list
      modules[moduleName] = module;
      //create an array to hold the list of methods in the modules
      //each method represents a handler for an event
      for (property in module) {
        //if it doesnt already exist
        if (!eventListeners[property]) {
          //create an array to hold the modules with a listener for this event
          eventListeners[property] = [];
        }
        //add this module to the list
        eventListeners[property].push(module);
      }
      //increase the total number of loaded modules
      totalLoadedModules++;
      //when all the modules have loaded
      if (totalLoadedModules == list.length) {
        for (property in modules) {
          //modules[property].modules = modules;
        }
        //bind the socket message handler
        //when we get a message from the server
        socket.on('message', function(obj){
          //make sure we have a listener bound for this event type
          if (eventListeners[obj.type]) {
            //for each event listener for this type
            eventListeners[obj.type].forEach(function(module) {
                //execute it
                module[obj.type](obj.args);
            })
          }
          else {
            throw new Error("No module with listener for event type "+obj.type);
          }
        });
        //run the users callback
        callback();
      }
    }
  }
}