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
    $('#auth .success').html('Name changed to '+args.name).fadeIn().delay(2000).fadeOut(function() {
      //hide the form and title
      $('#auth h2').fadeOut();
      $('#auth form').fadeOut(function() {
        //show the link
        $('#auth .showlink').fadeIn();
      })
    });
    //re-endable the submit button
    $('#setName').find('input[type=submit]').attr('disabled', false);
  }
  
  $('#auth .showlink').click(function() {
    $('#auth .showlink').fadeOut(function() {
      $('#auth form').fadeIn();
      $('#auth h2').fadeIn();
    });
    return false;
  });
  
  //bind the setName form submission
  $('#setName').submit(function() {
    $('#setName').find('input[type=submit]').attr('disabled', true);
    //hide the error/success if there was one
    $('#auth .error').hide();
    $('#auth .success').hide();
    //get the name from the input textbox in the form
    var name = $(this).find('input[type=text]').val();
    //use our shared isValidName class to see if the name is valid
    if (isValidName.check(name)) {
      //send the request to the server to change the name
      socket.send({type: 'setName', args: {name: name}});
    }
    else {
      //show and update the eerror
      $('#auth .error').html('Name can only contain numbers and letters').fadeIn();
      $('#setName').find('input[type=submit]').attr('disabled', false);
    }
    return false;
  });
}