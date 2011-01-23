/*
Module for sending authentication calls to the server
A new instance of this object is created when the module is loaded
All DOM event bindings inside this object will be bound
*/

//create our object that is shared with the server
var isValidName = new isValidName;

function auth(socket) {
  //to avoid this confusion
  var auth = this;
 
  /*
  *Called when a nameSet command comes from the server
  *@arg     args           the arguments the server sent with the message
  *             .name      name set to
  */
  this.nameSet = function(args) {
    $('#auth .success').html('Name changed to '+args.name).fadeIn().delay(2000).fadeOut();
    console.log(modules);
  }
  
  //bind the setName form submission
  $('#setName').submit(function() {
    //hide the error/success if there was one
    $('#auth .error').hide();
    $('#auth .success').hide();
    //get the name from the input textbox in the form
    var name = $(this).find('input[type=text]').val();
    //use our shared isValidName class to see if the name is valid
    if (isValidName.check(name)) {
      //send the request to the server to change the name
      socket.send({event: 'setName', args: {name: name}});
    }
    else {
      //show and update the eerror
      $('#auth .error').html('Name can only contain numbers and letters').fadeIn();
    }
    return false;
  });
}