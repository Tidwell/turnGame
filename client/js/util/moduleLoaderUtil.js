var moduleLoaderUtil = function() { 
  this.load = function(moduleList, callback) {
    console.log(moduleList, callback);
    //load each module
    moduleList.forEach(function(moduleName) {
      $.getScript('/js/modules/'+moduleName+'.js', function(){ moduleLoadComplete() });
    });
    var totalLoadedModules = 0;
    var moduleLoadComplete = function() {
      totalLoadedModules++;
      //when all the modules have loaded
      if (totalLoadedModules == list.length) {
        //run the users callback
        callback();
      }
    }
  }
}