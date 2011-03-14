/*
Creates a message handler object to be passed to modules to attach their listeners to
*/
 
//assignment/loading
var   
      //node.js libraries
      events = require('events')

//create our event emitter object
function eventEmit() {
    events.EventEmitter.call(this);
}
//inherit events.EventEmitter
eventEmit.super_ = events.EventEmitter;
eventEmit.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: eventEmit,
        enumerable: false
    }
});

//export the class definition
module.exports = eventEmit;