function moduleLoader() {
  var loader = this;
  
  this.modules = {};
  
  this.init = function(obj) {
    var modulesToLoad = require(process.cwd()+'/'+obj.clientFolderPath+'/shared/modulesToLoad');
    
    //attach the listeners for each of the modules 
    modulesToLoad.forEach(function(moduleName) {
      //todo pass in serverFolderPath
      var modulePrototype = require('./../modules/'+moduleName);
      var module = new modulePrototype({
        clientPath: process.cwd()+'/'+obj.clientFolderPath,
        client: obj.moduleEventEmitter
      });
      loader.modules[moduleName] = module;
    })
  }
}

module.exports = new moduleLoader;