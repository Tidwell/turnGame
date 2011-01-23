var moduleLoaderUtil = function(socket) { 
  this.load = function(callback) {
    //get the list of modules to load (from shared class included on index)
    var moduleList = new modulesToLoad;
        
    //load each module
    moduleList.forEach(function(moduleName) {
      $.getScript('/js/modules/'+moduleName+'.js', function(){ moduleLoadComplete(moduleName) });
    });
    var totalLoadedModules = 0;
    var moduleLoadComplete = function(moduleName) {
      //initialize the module 
      //--- DIRTY UGLY EVAL, so we make sure the module name only contains numbers and letters
      var regex=/[A-Za-z0-9]$/;
      if(!regex.test(moduleName)) return;
      //if it passed, we create it using eval *bleh*
      var module = eval('new '+moduleName+'(socket)');
      //increase the total number of loaded modules
      totalLoadedModules++;
      //when all the modules have loaded
      if (totalLoadedModules == list.length) {
        //run the users callback
        callback();
      }
    }
  }
}