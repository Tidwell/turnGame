var moduleLoaderUtil = function() { 
  var callback;
  this.load = function(userCallback) {
    callback = userCallback;
    //get the list of modules to load (from shared class included on index)
    var moduleList = new modulesToLoad;
    //load each module
    moduleList.forEach(function(moduleName) {
      $.getScript('/js/modules/'+moduleName+'.js', function(data){ moduleLoadComplete(moduleName) });
    });
  }
  
  var totalLoadedModules = 0;
  var eventListeners = {};

  var moduleLoadComplete = function(moduleName) {
    //increase the total number of loaded modules
    totalLoadedModules++;
    //when all the modules have loaded
    if (totalLoadedModules == list.length) {
      allModulesLoaded();
      //run the users callback
      callback();
    }
  }
  
  var allModulesLoaded = function() {
    for (moduleName in modules) {
      //create an array to hold the list of methods in the modules
      //this is to fake event listeners
      //each method represents a handler for an event
      for (property in modules[moduleName]) {
        //if it doesnt already exist
        if (!eventListeners[property]) {
          //create an array to hold the modules with a listener for this event
          eventListeners[property] = [];
        }
        //add this module to the list
        eventListeners[property].push(moduleName);
      }
    }
    //bind the socket message handler
    //when we get a message from the server
    socket.on('message', function(obj){
      //make sure we have a listener bound for this event type
      if (eventListeners[obj.type]) {
        //for each event listener for this type
        eventListeners[obj.type].forEach(function(moduleName) {
            //execute it
            modules[moduleName][obj.type](obj.args);
        })
      }
      else {
        throw new Error("No module with listener for event type "+obj.type);
      }
    });
  }
}