function moduleLoader() {
  var loader = this;
  this.modules = {};
  
  this.init = function(obj) {
    var modulesToLoad = require(process.cwd()+'/'+obj.clientFolderPath+'/shared/modulesToLoad');
    
    //attach the listeners for each of the modules 
    modulesToLoad.forEach(function(moduleName) {
      if (loader.modules[moduleName]) {
        throw new Error('Multiple modules named: '+moduleName+' please rename one of them')
      }
      //todo pass in serverFolderPath
      var serverFolderPath = process.cwd()+'/'+obj.clientFolderPath+'/../server/modules/';
      var modulePrototype = require(serverFolderPath+moduleName);
      //var modulePrototype = require('./../modules/'+moduleName);
      
      //Note we are defining the object that needs to be passed into the
      //module instantiation
      var module = new modulePrototype({
        clientPath: process.cwd()+'/'+obj.clientFolderPath,
        client: obj.moduleEventEmitter,
        gamestateTemplate: obj.gamestateTemplate,
        gameSettings: obj.gameSettings    
      });
      //add the module to the list of loaded modules
      loader.modules[moduleName] = module;
    })
  }
}

module.exports = new moduleLoader;