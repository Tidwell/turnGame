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
  //method to send a setName request to the server
  //@args name  STRING
  this.setName = function(name) {
    socket.send({event: 'setName', args: {name: name}});
  }
  
  //bind the setName form submission
  $('#setName').submit(function() {
    //hide the error if there was one
    $('#auth .error').hide();
    //get the name from the input textbox in the form
    var name = $(this).find('input[type=text]').val();
    //use our shared isValidName class to see if the name is valid
    if (isValidName.check(name)) {
      //send the request to the server to change the name
      auth.setName(name);
    }
    else {
      //show and update the eerror
      $('#auth .error').html('Name can only contain numbers and letters').fadeIn();
    }
    return false;
  });
}